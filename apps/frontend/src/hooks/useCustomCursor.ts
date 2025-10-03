import { useState, useEffect, useCallback } from 'react';

interface UseCustomCursorProps {
  totalItems: number;
  initialIndex?: number;
}

export function useCustomCursor({
  totalItems,
  initialIndex = 0,
}: UseCustomCursorProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const nextItem = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === totalItems - 1 ? 0 : prevIndex + 1
    );
  }, [totalItems]);

  const prevItem = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalItems - 1 : prevIndex - 1
    );
  }, [totalItems]);

  const goToItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalItems) {
        setCurrentIndex(index);
      }
    },
    [totalItems]
  );

  const handleMouseEnter = useCallback(() => {
    setIsCursorVisible(true);
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsCursorVisible(false);
    setIsHovering(false);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!isCursorVisible) {
      setIsCursorVisible(true);
    }
  }, [isCursorVisible]);

  return {
    currentIndex,
    setCurrentIndex,
    nextItem,
    prevItem,
    goToItem,
    isCursorVisible,
    setIsCursorVisible,
    cursorPosition,
    isHovering,
    setIsHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
  };
}
