import React from 'react';
import { ProductVariant } from '@/types/collection';
import { mapNameToHex } from '@/utils/mapNameToHex';

interface VariantSwatchesProps {
  variants: ProductVariant[];
  maxVisible?: number;
}

// Extend ProductVariant to include colorHex
type VariantWithColor = ProductVariant & { colorHex: string };

export default function VariantSwatches({
  variants,
  maxVisible = 4,
}: VariantSwatchesProps) {
  const availableVariants = variants.filter((v) => v.available);

  // if none are available, fallback to first variant
  const variantsToUse =
    availableVariants.length > 0 ? availableVariants : [variants[0]];

  // map to include colorHex and remove duplicates
  const colorVariants = variantsToUse
    .map((variant) => {
      const colorHex = variant.option1
        ? (mapNameToHex(variant.option1) ?? '#000')
        : '#000';
      return { ...variant, colorHex } as VariantWithColor;
    })
    .filter((variant) => variant.colorHex)
    .reduce((uniqueMap, variant) => {
      if (!uniqueMap.has(variant.colorHex)) {
        uniqueMap.set(variant.colorHex, variant);
      }
      return uniqueMap;
    }, new Map<string, VariantWithColor>());

  const uniqueVariants = Array.from(colorVariants.values());
  const visibleVariants = uniqueVariants.slice(0, maxVisible);
  const remainingCount = uniqueVariants.length - maxVisible;

  return (
    <div className="flex items-center space-x-2">
      {visibleVariants.map((variant, index) => (
        <span
          key={variant.id}
          className={`h-5 w-5 rounded-full border ${
            !variant.available ? 'unavailable_color' : ''
          } ${index === 0 ? 'selected_color' : ''}`}
          style={{ backgroundColor: variant.colorHex }}
          title={variant.option1 || variant.title}
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
