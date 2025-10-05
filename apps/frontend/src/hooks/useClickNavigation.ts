import { useCallback, useState } from 'react';

interface UseClickNavigationProps {
  nextItem: () => void;
  prevItem: () => void;
  leftZonePercentage?: number;
  rightZonePercentage?: number;
}

interface ClickNavigationReturn {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  cursorSide: 'left' | 'right' | 'center';
}

export function useClickNavigation({
  nextItem,
  prevItem,
  leftZonePercentage = 40,
  rightZonePercentage = 60,
}: UseClickNavigationProps): ClickNavigationReturn {
  const [cursorSide, setCursorSide] = useState<'left' | 'right' | 'center'>(
    'center'
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const width = rect.width;
      const leftZone = (width * leftZonePercentage) / 100;
      const rightZone = (width * rightZonePercentage) / 100;

      if (mouseX < leftZone) {
        setCursorSide('left');
      } else if (mouseX > rightZone) {
        setCursorSide('right');
      } else {
        setCursorSide('center');
      }
    },
    [leftZonePercentage, rightZonePercentage]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const leftZone = (width * leftZonePercentage) / 100;
      const rightZone = (width * rightZonePercentage) / 100;
      if (clickX < leftZone) {
        prevItem();
      } else if (clickX > rightZone) {
        nextItem();
      }
    },
    [nextItem, prevItem, leftZonePercentage, rightZonePercentage]
  );

  return { handleClick, handleMouseMove, cursorSide };
}
