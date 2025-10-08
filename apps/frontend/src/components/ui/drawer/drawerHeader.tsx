import { HTMLAttributes, ReactNode } from 'react';

interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerHeader = ({
  children,
  className = '',
  ...props
}: DrawerHeaderProps) => {
  return (
    <div className={`border-b p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
