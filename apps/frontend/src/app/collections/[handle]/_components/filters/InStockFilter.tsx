'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface InStockFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function InStockFilter({ checked, onChange }: InStockFilterProps) {
  return (
    <div className="flex items-center justify-between border-t border-b py-5">
      <Label htmlFor="in-stock" className="text-sm">
        In Stock
      </Label>
      <Switch id="in-stock" checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
