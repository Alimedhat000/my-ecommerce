import React from 'react';
import { ProductVariant, ProductImage } from '@/types/collection';
import { mapNameToHex } from '@/utils/mapNameToHex';

interface VariantSwatchesProps {
  variants: ProductVariant[];
  images: ProductImage[];
  selectedImage: ProductImage;
  maxVisible?: number;
  onSwatchClick: (image: ProductImage) => void;
}

export default function VariantSwatches({
  variants,
  images,
  selectedImage,
  maxVisible = 4,
  onSwatchClick,
}: VariantSwatchesProps) {
  const availableVariants = variants.filter((v) => v.available);
  const variantsToUse =
    availableVariants.length > 0 ? availableVariants : [variants[0]];

  const colorVariants = Array.from(
    new Map(
      variantsToUse.map((v) => {
        const colorHex = v.option1
          ? (mapNameToHex(v.option1) ?? '#000')
          : '#000';
        return [colorHex, { ...v, colorHex }];
      })
    ).values()
  );

  const visibleVariants = colorVariants.slice(0, maxVisible);
  const remainingCount = colorVariants.length - maxVisible;

  const handleClick = (variant: ProductVariant & { colorHex: string }) => {
    const variantImage = images.find((img) =>
      img.variantIds.includes(variant.shopifyId)
    );
    if (variantImage) onSwatchClick(variantImage);
  };

  return (
    <div className="flex items-center space-x-2">
      {visibleVariants.map((variant) => (
        <span
          key={variant.id}
          className={`border-muted-foreground h-4 w-4 cursor-pointer rounded-full border-[0.5px] ${
            selectedImage.variantIds.includes(variant.shopifyId)
              ? 'ring-2 ring-black ring-offset-2'
              : ''
          }`}
          style={{ backgroundColor: variant.colorHex }}
          title={variant.option1 || variant.title}
          onClick={() => handleClick(variant)}
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
