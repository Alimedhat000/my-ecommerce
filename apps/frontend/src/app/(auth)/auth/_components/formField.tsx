'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends React.ComponentProps<'input'> {
  id: string;
  label: string;
  variant?: 'default' | 'brand';
  containerClassName?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  variant = 'default',
  containerClassName,
  className,
  ...props
}: FormFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    props.onChange?.(e);
  };

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className={cn('relative', containerClassName)}>
      <Input
        id={id}
        type={type}
        variant={variant}
        className={cn('peer pt-6 pb-2', className)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder=" "
        {...props}
      />
      <Label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-3 transition-all duration-200',
          isLabelFloating
            ? 'top-2 text-xs text-gray-600'
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
        )}
      >
        {label}
      </Label>
    </div>
  );
}
