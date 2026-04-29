import { HTMLAttributes, ReactNode } from 'react';

interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DrawerFooter = ({
  children,
  className = '',
  ...props
}: DrawerFooterProps) => {
  return (
    <div className={`border-t p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
