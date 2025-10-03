import React from 'react';

interface CustomCursorProps {
  isVisible: boolean;
  position: { x: number; y: number };
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  arrowColor?: string;
  className?: string;
  cursorSide?: 'left' | 'right' | 'center';
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  isVisible,
  position,
  size = 48,
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  borderColor = 'rgba(156, 163, 175, 0.8)',
  arrowColor = 'currentColor',
  className = '',
  cursorSide = 'center',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`pointer-events-none fixed z-50 transition-transform duration-100 ease-out ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Show left arrow only when on left side */}
        {cursorSide === 'left' && (
          <div
            className="flex items-center justify-center"
            style={{ color: arrowColor }}
          >
            <svg
              width={size * 0.4}
              height={size * 0.4}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        )}

        {/* Show right arrow only when on right side */}
        {cursorSide === 'right' && (
          <div
            className="flex items-center justify-center"
            style={{ color: arrowColor }}
          >
            <svg
              width={size * 0.4}
              height={size * 0.4}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}

        {/* Show both arrows when in center */}
        {cursorSide === 'center' && (
          <>
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 transform opacity-60"
              style={{ color: arrowColor }}
            >
              <svg
                width={size * 0.25}
                height={size * 0.25}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
            <div
              className="absolute top-1/2 right-3 -translate-y-1/2 transform opacity-60"
              style={{ color: arrowColor }}
            >
              <svg
                width={size * 0.25}
                height={size * 0.25}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
