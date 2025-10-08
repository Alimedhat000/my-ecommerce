'use client';

import { useMemo, useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceFilterProps {
  priceRange?: { min: number; max: number };
  searchParams: URLSearchParams;
  onPriceChange: (values: number[]) => void;
  onPriceCommit: (values: number[]) => void;
}

export function PriceFilter({
  priceRange,
  searchParams,
  onPriceChange,
  onPriceCommit,
}: PriceFilterProps) {
  const minLimit = priceRange?.min || 0;
  const maxLimit = priceRange?.max || 1750;

  const currentPriceValues = useMemo(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    return [
      minPrice ? Math.max(minLimit, parseInt(minPrice)) : minLimit,
      maxPrice ? Math.min(maxLimit, parseInt(maxPrice)) : maxLimit,
    ];
  }, [searchParams, minLimit, maxLimit]);

  const [localPriceValues, setLocalPriceValues] = useState(currentPriceValues);
  const [inputValues, setInputValues] = useState([
    currentPriceValues[0].toString(),
    currentPriceValues[1].toString(),
  ]);

  // Sync local state with URL changes
  useEffect(() => {
    setLocalPriceValues(currentPriceValues);
    setInputValues([
      currentPriceValues[0].toString(),
      currentPriceValues[1].toString(),
    ]);
  }, [currentPriceValues]);

  const handleSliderChange = (values: number[]) => {
    setLocalPriceValues(values);
    setInputValues([values[0].toString(), values[1].toString()]);
    onPriceChange(values);
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    const newInputValues = [...inputValues];
    newInputValues[index] = numericValue;
    setInputValues(newInputValues);
    // Update local price values for immediate slider feedback
    if (numericValue) {
      const numValue = parseInt(numericValue);
      const newPriceValues = [...localPriceValues];

      // Validate bounds
      if (index === 0) {
        newPriceValues[0] = Math.max(
          minLimit,
          Math.min(numValue, localPriceValues[1])
        );
      } else {
        newPriceValues[1] = Math.min(
          maxLimit,
          Math.max(numValue, localPriceValues[0])
        );
      }

      setLocalPriceValues(newPriceValues);
    }
  };

  const handleInputBlur = (index: number) => {
    const numericValue = inputValues[index]
      ? parseInt(inputValues[index])
      : index === 0
        ? minLimit
        : maxLimit;

    const newPriceValues = [...localPriceValues];

    // Validate and clamp values
    if (index === 0) {
      newPriceValues[0] = Math.max(
        minLimit,
        Math.min(numericValue, localPriceValues[1])
      );
    } else {
      newPriceValues[1] = Math.min(
        maxLimit,
        Math.max(numericValue, localPriceValues[0])
      );
    }

    // Ensure min doesn't exceed max and vice versa
    if (newPriceValues[0] > newPriceValues[1]) {
      if (index === 0) {
        newPriceValues[1] = newPriceValues[0];
      } else {
        newPriceValues[0] = newPriceValues[1];
      }
    }

    setLocalPriceValues(newPriceValues);
    setInputValues([
      newPriceValues[0].toString(),
      newPriceValues[1].toString(),
    ]);

    // Commit the changes
    onPriceCommit(newPriceValues);
  };

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur(index);
    }
  };

  return (
    <div className="my-8 space-y-4 px-4">
      <Slider
        value={localPriceValues}
        onValueChange={handleSliderChange}
        onValueCommit={onPriceCommit}
        max={maxLimit}
        min={minLimit}
        step={5}
        className="w-full"
      />

      <div className="flex items-center justify-between gap-4">
        {/* Min Price Input */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="min-price" className="text-muted-foreground text-xs">
            Min Price
          </Label>
          <div className="relative">
            <Input
              id="min-price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValues[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(0, e)}
              className="pr-8"
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              EGP
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center pt-6">
          <span className="text-muted-foreground">-</span>
        </div>

        {/* Max Price Input */}
        <div className="flex-1 space-y-2">
          <Label
            htmlFor="max-price"
            className="text-muted-foreground flex w-full justify-end text-xs"
          >
            Max Price
          </Label>
          <div className="relative">
            <Input
              id="max-price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValues[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(1, e)}
              className="pr-8"
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              EGP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
