import { useState, useEffect, useCallback } from 'react';

interface UseCustomCursorProps {
  totalItems: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function useCustomCursor({
  totalItems,
  currentIndex,
  onIndexChange,
}: UseCustomCursorProps) {
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

  // Fixed: Calculate next/prev based on currentIndex
  const nextItem = useCallback(() => {
    const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
    onIndexChange(newIndex);
  }, [totalItems, currentIndex, onIndexChange]);

  const prevItem = useCallback(() => {
    const newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    onIndexChange(newIndex);
  }, [totalItems, currentIndex, onIndexChange]);

  const goToItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalItems) {
        onIndexChange(index);
      }
    },
    [totalItems, onIndexChange]
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
