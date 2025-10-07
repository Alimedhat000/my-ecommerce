import { HTMLAttributes, useState, useEffect } from 'react';
import { useDrawer } from './drawerContext';

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  width?: string;
  height?: string;
  overlay?: boolean;
  overlayColor?: string;
  closeOnOverlayClick?: boolean;
}

export const Drawer = ({
  children,
  width = '400px',
  height = '100vh',
  overlay = true,
  overlayColor = 'bg-black/50',
  closeOnOverlayClick = true,
  className = '',
  ...props
}: DrawerProps) => {
  const { isOpen, closeDrawer, side } = useDrawer();
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      closeDrawer();
    }
  };

  const handleDrawerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const sideClasses: Record<string, string> = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 right-0 w-full',
    bottom: 'bottom-0 left-0 right-0 w-full',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const getTransformOrigin = (): string => {
    switch (side) {
      case 'left':
        return 'left center';
      case 'right':
        return 'right center';
      case 'top':
        return 'center top';
      case 'bottom':
        return 'center bottom';
      default:
        return 'center center';
    }
  };

  const getTransformClasses = (): string => {
    if (!isAnimating) {
      // Initial state - drawer is scaled down
      if (side === 'left' || side === 'right') {
        return 'scale-x-0';
      } else if (side === 'top' || side === 'bottom') {
        return 'scale-y-0';
      } else {
        return 'scale-95 opacity-0';
      }
    }
    // Animated state - drawer is at full scale
    return 'scale-100 opacity-100';
  };

  const getDrawerStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      transformOrigin: getTransformOrigin(),
    };

    if (side === 'left' || side === 'right') {
      style.width = width;
      style.height = height;
    } else if (side === 'top' || side === 'bottom') {
      style.width = '100%';
      style.height = height === '100vh' ? '200px' : height;
    } else if (side === 'center') {
      style.width = width;
      style.height = height === '100vh' ? 'auto' : height;
      style.maxWidth = '90vw';
      style.maxHeight = '90vh';
    }

    return style;
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${isAnimating ? overlayColor : 'opacity-0'
            }`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed ${sideClasses[side]} z-50 flex flex-col transition-all duration-300 ease-in-out ${getTransformClasses()} ${className}`}
        style={getDrawerStyle()}
        onClick={handleDrawerClick}
        {...props}
      >
        {children}
      </div>
    </>
  );
};
