'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps extends React.ComponentProps<'input'> {
  id: string;
  label: string;
  variant?: 'default' | 'brand';
  containerClassName?: string;
  register?: UseFormRegisterReturn;
  error?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  variant = 'default',
  containerClassName,
  className,
  register,
  error,
  ...props
}: FormFieldProps) {
  const [hasValue, setHasValue] = React.useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    props.onBlur?.(e);
    register?.onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    props.onChange?.(e);
    register?.onChange(e);
  };

  const isLabelFloating = hasValue;

  return (
    <div className={cn('relative', containerClassName)}>
      <Input
        id={id}
        type={type}
        variant={variant}
        className={cn('peer h-13 pt-4 pb-2', className)}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder=" "
        aria-invalid={error ? 'true' : 'false'}
        {...(register ? { name: register.name, ref: register.ref } : {})}
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
