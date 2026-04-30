'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxFilterProps {
  type: 'single' | 'multi';
  filterKey: string;
  options: string[];
  searchParams: URLSearchParams;
  onSingleSelect: (filterKey: string, value: string | null) => void;
  onMultiSelect: (filterKey: string, value: string, checked: boolean) => void;
  isSingleSelected: (filterKey: string, value: string) => boolean;
  isMultiChecked: (filterKey: string, value: string) => boolean;
}

export function CheckboxFilter({
  type,
  filterKey,
  options,
  searchParams,
  onSingleSelect,
  onMultiSelect,
  isSingleSelected,
  isMultiChecked,
}: CheckboxFilterProps) {
  if (type === 'single') {
    return (
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${filterKey}-${option}`}
              checked={isSingleSelected(filterKey, option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSingleSelect(filterKey, option);
                } else {
                  if (searchParams.get(filterKey) === option) {
                    onSingleSelect(filterKey, null);
                  }
                }
              }}
            />
            <Label htmlFor={`${filterKey}-${option}`} className="text-sm">
              {option}
            </Label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={`${filterKey}-${option}`}
            checked={isMultiChecked(filterKey, option)}
            onCheckedChange={(checked) =>
              onMultiSelect(filterKey, option, checked as boolean)
            }
          />
          <Label htmlFor={`${filterKey}-${option}`} className="text-sm">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}
