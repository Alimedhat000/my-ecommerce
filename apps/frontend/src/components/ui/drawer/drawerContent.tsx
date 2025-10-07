import { HTMLAttributes, ReactNode } from 'react';

interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerContent = ({
  children,
  className = '',
  ...props
}: DrawerContentProps) => {
  return (
    <div
      className={`flex h-full w-full flex-col bg-white shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
