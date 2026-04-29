import React, {
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
  MouseEvent,
  cloneElement,
  isValidElement,
} from 'react';
import { useDrawer } from './drawerContext';

interface DrawerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

export const DrawerTrigger = ({
  children,
  className = '',
  asChild = false,
  ...props
}: DrawerTriggerProps) => {
  const { openDrawer } = useDrawer();

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: (event: MouseEvent) => void;
    }>;

    return cloneElement(child, {
      onClick: (event: MouseEvent) => {
        openDrawer();
        if (typeof child.props.onClick === 'function') {
          child.props.onClick(event);
        }
      },
    });
  }

  return (
    <button onClick={openDrawer} className={className} {...props}>
      {children}
    </button>
  );
};
