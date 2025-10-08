import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useDrawer } from './drawerContext';

interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DrawerClose = ({
  children,
  className = '',
  ...props
}: DrawerCloseProps) => {
  const { closeDrawer } = useDrawer();
  return (
    <button onClick={closeDrawer} className={className} {...props}>
      {children}
    </button>
  );
};
