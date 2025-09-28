import React from 'react';

export interface ProductBadgeType {
  text: string;
  type: 'sale' | 'category' | 'feature' | 'custom';
  color?: string;
  backgroundColor?: string;
}

interface ProductBadgeProps {
  badge: ProductBadgeType;
}

const getBadgeStyles = (type: ProductBadgeType['type']) => {
  const styles = {
    sale: 'bg-destructive',
    category: 'bg-brand-orange',
    feature: 'bg-blue-600',
    custom: 'bg-gray-600',
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
