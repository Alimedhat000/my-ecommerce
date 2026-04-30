# Custom Cursor Navigation System

## Basic Usage

### 1. Simple Image Gallery

```tsx
import { useCustomCursor } from '@/hooks/useCustomCursor';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { useClickNavigation } from '@/hooks/useClickNavigation';

export function SimpleGallery({ images }: { images: string[] }) {
  // Initialize cursor and navigation state
  const {
    currentIndex,
    nextItem,
    prevItem,
    isCursorVisible,
    cursorPosition,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove: cursorHandleMouseMove,
  } = useCustomCursor({
    totalItems: images.length,
    initialIndex: 0,
  });

  // Handle click navigation and cursor side detection
  const {
    handleClick,
    handleMouseMove: navHandleMouseMove,
    cursorSide,
  } = useClickNavigation({
    nextItem,
    prevItem,
    leftZonePercentage: 40, // Left 40% triggers previous
    rightZonePercentage: 60, // Right 40% triggers next (100-60=40)
  });

  // Combine mouse move handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    cursorHandleMouseMove();
    navHandleMouseMove(e);
  };

  return (
    <>
      {/* Custom Cursor */}
      <CustomCursor
        isVisible={isCursorVisible && isHovering}
        position={cursorPosition}
        cursorSide={cursorSide}
      />

      {/* Clickable Area */}
      <div
        className="relative cursor-none"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <img src={images[currentIndex]} alt="Gallery" />
      </div>
    </>
  );
}
```

### 2. Video Player Navigation

```tsx
export function VideoSlider({ videos }: { videos: Video[] }) {
  const {
    currentIndex,
    nextItem,
    prevItem,
    isCursorVisible,
    cursorPosition,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove: cursorHandleMouseMove,
  } = useCustomCursor({
    totalItems: videos.length,
  });

  const {
    handleClick,
    handleMouseMove: navHandleMouseMove,
    cursorSide,
  } = useClickNavigation({
    nextItem,
    prevItem,
    leftZonePercentage: 30, // Smaller left zone
    rightZonePercentage: 70, // Larger right zone
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    cursorHandleMouseMove();
    navHandleMouseMove(e);
  };

  return (
    <>
      <CustomCursor
        isVisible={isCursorVisible && isHovering}
        position={cursorPosition}
        cursorSide={cursorSide}
        size={60}
        backgroundColor="rgba(0, 0, 0, 0.8)"
        arrowColor="#fff"
      />

      <div
        className="video-container cursor-none"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <video src={videos[currentIndex].url} />
      </div>
    </>
  );
}
```

### 3. Card Carousel

```tsx
export function CardCarousel({ cards }: { cards: Card[] }) {
  const {
    currentIndex,
    nextItem,
    prevItem,
    goToItem, // Jump to specific index
    isCursorVisible,
    cursorPosition,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove: cursorHandleMouseMove,
  } = useCustomCursor({
    totalItems: cards.length,
    initialIndex: 0,
  });

  const {
    handleClick,
    handleMouseMove: navHandleMouseMove,
    cursorSide,
  } = useClickNavigation({
    nextItem,
    prevItem,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    cursorHandleMouseMove();
    navHandleMouseMove(e);
  };

  return (
    <div>
      <CustomCursor
        isVisible={isCursorVisible && isHovering}
        position={cursorPosition}
        cursorSide={cursorSide}
      />

      {/* Main carousel area */}
      <div
        className="carousel cursor-none"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {cards.map((card, index) => (
            <div key={index} className="min-w-full">
              {card.content}
            </div>
          ))}
        </div>
      </div>

      {/* Optional: Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToItem(index)}
            className={currentIndex === index ? 'active' : ''}
          >
            •
          </button>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### useCustomCursor Hook

Manages navigation state and cursor visibility.

```tsx
const {
  currentIndex,      // Current item index
  setCurrentIndex,   // Manually set index
  nextItem,          // Go to next item
  prevItem,          // Go to previous item
  goToItem,          // Jump to specific index
  isCursorVisible,   // Is cursor shown
  setIsCursorVisible,
  cursorPosition,    // { x, y } coordinates
  isHovering,        // Is mouse over the area
  setIsHovering,
  handleMouseEnter,  // Mouse enter handler
  handleMouseLeave,  // Mouse leave handler
  handleMouseMove,   // Mouse move handler
} = useCustomCursor({
  totalItems: number,      // Required: Total number of items
  initialIndex?: number,   // Optional: Starting index (default: 0)
});
```

### useClickNavigation Hook

Handles click zones and detects cursor position.

```tsx
const {
  handleClick,       // Click handler for navigation
  handleMouseMove,   // Mouse move handler for side detection
  cursorSide,        // 'left' | 'right' | 'center'
} = useClickNavigation({
  nextItem: () => void,           // Required: Next navigation function
  prevItem: () => void,           // Required: Previous navigation function
  leftZonePercentage?: number,    // Optional: Left zone size (default: 40)
  rightZonePercentage?: number,   // Optional: Right zone start (default: 60)
});
```

**Zone Configuration:**

- `leftZonePercentage: 40` means left 40% of width triggers previous
- `rightZonePercentage: 60` means right 40% of width triggers next (from 60% to 100%)
- Middle 20% (40% to 60%) has no click action

### CustomCursor Component

Visual cursor that appears on hover.

```tsx
<CustomCursor
  isVisible={boolean} // Required: Show/hide cursor
  position={{ x: number, y: number }} // Required: Cursor coordinates
  cursorSide={'left' | 'right' | 'center'} // Required: Which side cursor is on
  size={number} // Optional: Cursor size in pixels (default: 48)
  backgroundColor={string} // Optional: Background color (default: rgba(255, 255, 255, 0.9))
  borderColor={string} // Optional: Border color (default: rgba(156, 163, 175, 0.8))
  arrowColor={string} // Optional: Arrow color (default: currentColor)
  className={string} // Optional: Additional CSS classes
/>
```

**Cursor States:**

- `cursorSide="left"` - Shows only left arrow (←)
- `cursorSide="right"` - Shows only right arrow (→)
- `cursorSide="center"` - Shows both arrows (← →)

## Customization Examples

### Dark Theme Cursor

```tsx
<CustomCursor
  isVisible={isCursorVisible && isHovering}
  position={cursorPosition}
  cursorSide={cursorSide}
  size={56}
  backgroundColor="rgba(0, 0, 0, 0.95)"
  borderColor="rgba(255, 255, 255, 0.3)"
  arrowColor="#ffffff"
  className="shadow-2xl backdrop-blur-md"
/>
```

### Minimal Cursor

```tsx
<CustomCursor
  isVisible={isCursorVisible && isHovering}
  position={cursorPosition}
  cursorSide={cursorSide}
  size={40}
  backgroundColor="rgba(255, 255, 255, 0.7)"
  borderColor="transparent"
  arrowColor="#000000"
/>
```

### Asymmetric Click Zones

```tsx
// Left side takes 70%, right side takes 20%, center 10%
const {
  handleClick,
  handleMouseMove: navHandleMouseMove,
  cursorSide,
} = useClickNavigation({
  nextItem,
  prevItem,
  leftZonePercentage: 70,
  rightZonePercentage: 80,
});
```

## Best Practices

1. **Always combine mouse move handlers**

   ```tsx
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     cursorHandleMouseMove();
     navHandleMouseMove(e);
   };
   ```

2. **Add `cursor-none` class** to hide default cursor

   ```tsx
   <div className="cursor-none" /* ... */>
   ```

3. **Check both visibility conditions** for the cursor

   ```tsx
   <CustomCursor
     isVisible={isCursorVisible && isHovering}
     // ...
   />
   ```

4. **Use semantic HTML** for better accessibility

   ```tsx
   <button onClick={() => prevItem()} aria-label="Previous">←</button>
   <button onClick={() => nextItem()} aria-label="Next">→</button>
   ```

5. **Add keyboard navigation** for accessibility
   ```tsx
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'ArrowLeft') prevItem();
       if (e.key === 'ArrowRight') nextItem();
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [prevItem, nextItem]);
   ```

## Troubleshooting

**Cursor not appearing:**

- Ensure both `isCursorVisible && isHovering` are true
- Check that `cursor-none` class is applied to the container
- Verify the cursor's z-index is high enough (default: z-50)

**Click zones not working:**

- Make sure you're combining both mouse move handlers
- Verify percentages add up correctly (left + right should leave some center space)
- Check that `onClick={handleClick}` is attached to the container

**Cursor position offset:**

- The cursor uses `transform: translate(-50%, -50%)` to center itself
- Position is tracked globally via window mouse events
- Ensure no CSS transforms on parent elements interfere

## Examples Repository

Find complete working examples at: [your-repo-link]

## License

MIT
