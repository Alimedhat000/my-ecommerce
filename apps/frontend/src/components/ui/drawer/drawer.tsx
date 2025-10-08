import {
  HTMLAttributes,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from 'react';
import { useDrawer } from './drawerContext';

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  width?: string;
  height?: string;
  overlay?: boolean;
  overlayColor?: string;
  closeOnOverlayClick?: boolean;
}

// Context to share animation state with DrawerContent
interface DrawerAnimationContextType {
  isContentVisible: boolean;
}

const DrawerAnimationContext = createContext<DrawerAnimationContextType>({
  isContentVisible: false,
});

export const useDrawerAnimation = () => useContext(DrawerAnimationContext);

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
  const [isContentVisible, setIsContentVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsContentVisible(false);

      // Small delay to ensure DOM is updated before starting animation
      const animationTimer = setTimeout(() => {
        setIsAnimating(true);

        // Show content after drawer animation starts
        const contentTimer = setTimeout(() => {
          setIsContentVisible(true);
        }, 200);

        return () => clearTimeout(contentTimer);
      }, 10);

      return () => clearTimeout(animationTimer);
    } else {
      setIsContentVisible(false);
      setIsAnimating(false);

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

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
    top: 'top-0 right-0 w-full',
    bottom: 'bottom-0 right-0 w-full',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const getTransformClasses = (): string => {
    // Always start with hidden state
    if (!isAnimating) {
      switch (side) {
        case 'left':
          return '-translate-x-full';
        case 'right':
          return 'translate-x-full';
        case 'top':
          return '-translate-y-full';
        case 'bottom':
          return 'translate-y-full';
        case 'center':
          return 'scale-95 opacity-0';
        default:
          return 'scale-95 opacity-0';
      }
    }

    // Animated state
    switch (side) {
      case 'left':
      case 'right':
        return 'translate-x-0';
      case 'top':
      case 'bottom':
        return 'translate-y-0';
      case 'center':
        return 'scale-100 opacity-100';
      default:
        return 'scale-100 opacity-100';
    }
  };

  const getTransitionClass = (): string => {
    return 'transition-all duration-300 ease-in-out';
  };

  const getDrawerStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (side === 'left' || side === 'right') {
      style.width = width;
      style.height = height;
    } else if (side === 'top' || side === 'bottom') {
      style.width = width || '100%';
      style.height = height === '100vh' ? '200px' : height;
    } else if (side === 'center') {
      style.width = width;
      style.height = height === '100vh' ? 'auto' : height;
      style.maxWidth = '90vw';
      style.maxHeight = '90vh';
    }

    return style;
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  return (
    <DrawerAnimationContext.Provider value={{ isContentVisible }}>
      {/* Overlay */}
      {overlay && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            isAnimating ? 'opacity-100 ' + overlayColor : 'opacity-0'
          }`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={`fixed ${sideClasses[side]} z-50 flex max-w-full flex-col p-4 ${getTransitionClass()} ${getTransformClasses()} ${className}`}
        style={getDrawerStyle()}
        onClick={handleDrawerClick}
        {...props}
      >
        {children}
      </div>
    </DrawerAnimationContext.Provider>
  );
};
