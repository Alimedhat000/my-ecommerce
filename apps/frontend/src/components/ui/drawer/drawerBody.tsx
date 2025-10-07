import { HTMLAttributes, ReactNode } from 'react';

interface DrawerBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerBody = ({
  children,
  className = '',
  ...props
}: DrawerBodyProps) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
