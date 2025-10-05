import { ProductBadge as ProductBadgeType } from '@/types/collection';
import React from 'react';

interface ProductBadgeProps {
  badge: ProductBadgeType;
}

const getBadgeStyles = (type: ProductBadgeType['type']) => {
  const styles = {
    sale: 'bg-destructive',
    category: 'bg-brand-orange',
    feature: 'bg-[#84e92d]',
    custom: 'bg-gray-600',
    soldout: 'bg-black',
  };
  return styles[type] || styles.custom;
};

export default function ProductBadge({ badge }: ProductBadgeProps) {
  const baseClasses = 'rounded-full px-2 py-1 text-xs font-semibold text-white';
  const typeClasses = getBadgeStyles(badge.type);
  const customStyles = badge.backgroundColor
    ? { backgroundColor: badge.backgroundColor }
    : {};

  return (
    <span className={`${baseClasses} ${typeClasses}`} style={customStyles}>
      {badge.text}
    </span>
  );
}
