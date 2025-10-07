import { createContext, useContext } from 'react';

export interface DrawerContextType {
  isOpen: boolean;
  side: 'left' | 'right' | 'top' | 'bottom' | 'center';
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextType | undefined>(
  undefined
);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
