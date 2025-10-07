import { HTMLAttributes, ReactNode } from 'react';
import { useDrawerAnimation } from './drawer';

interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerContent = ({
  children,
  className = '',
  ...props
}: DrawerContentProps) => {
  const { isContentVisible } = useDrawerAnimation();

  return (
    <div
      className={`text-background bg-foreground font-body flex h-full w-full flex-col rounded-2xl shadow-2xl ${className}`}
      {...props}
    >
      <div
        className={`relative flex h-full w-full flex-col transition-opacity duration-200 ease-in-out ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
