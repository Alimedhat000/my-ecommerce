'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  variant?: 'default' | 'brand';
}

function Input({ className, type, variant = 'default', ...props }: InputProps) {
  const baseStyles =
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-14 w-full bg-transparent px-3 text-base transition-[color,box-shadow,border] outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm';
  const focusStyles =
    'focus-visible:ring-0 aria-invalid:ring-destructive/20 aria-invalid:border-destructive';
  const variants = {
    default: 'border border-gray-300 rounded-md focus:border-gray-400',
    brand:
      'border-2 border-[#ff8c42] focus:border-[#ff8c42] rounded-2xl bg-white',
  };
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(baseStyles, focusStyles, variants[variant], className)}
      {...props}
    />
  );
}

export { Input };
