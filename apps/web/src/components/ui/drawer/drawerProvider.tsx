import { useCallback, useEffect, useState, ReactNode } from 'react';
import { DrawerContext, DrawerContextType } from './drawerContext';

interface DrawerProviderProps {
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  onOpenChange?: (isOpen: boolean) => void;
}

export const DrawerProvider = ({
  children,
  side = 'right',
  onOpenChange,
}: DrawerProviderProps) => {
  // Always start closed for SSR - prevents hydration mismatch
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  }, [onOpenChange]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [closeDrawer, isOpen]);

  const contextValue: DrawerContextType = {
    isOpen,
    side,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
    </DrawerContext.Provider>
  );
};
