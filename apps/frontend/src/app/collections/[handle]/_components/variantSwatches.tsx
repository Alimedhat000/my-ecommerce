import React from 'react';
import { ProductVariant } from '@/types/collection';

interface VariantSwatchesProps {
  variants: ProductVariant[];
  maxVisible?: number;
}

export default function VariantSwatches({
  variants,
  maxVisible = 4,
}: VariantSwatchesProps) {
  const colorVariants = variants.filter((variant) => variant.colorHex);
  const visibleVariants = colorVariants.slice(0, maxVisible);
  const remainingCount = colorVariants.length - maxVisible;

  if (colorVariants.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      {visibleVariants.map((variant, index) => (
        <span
          key={variant.id}
          className={`h-5 w-5 rounded-full border ${
            !variant.available ? 'unavailable_color' : ''
          } ${index === 0 ? 'selected_color' : ''}`}
          style={{ backgroundColor: variant.colorHex }}
          title={variant.colorName || variant.title}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full border text-xs">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
