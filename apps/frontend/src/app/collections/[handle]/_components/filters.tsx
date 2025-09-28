'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Filters() {
  return (
    <aside aria-label="Filters" className="hidden h-full space-y-6 md:block">
      <div className="sticky -top-[20px] h-fit">
        <h2 className="text-lg font-semibold">Filters</h2>

        <div className="flex items-center justify-between border-t border-b py-10">
          <Label htmlFor="in-stock" className="text-sm">
            In Stock
          </Label>
          <Switch id="in-stock" />
        </div>
        {/* Accordion for categories */}
        <Accordion type="multiple" className="w-full">
          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger>Price</AccordionTrigger>
            <AccordionContent>
              <div className="my-8 space-y-4 px-4">
                <Slider
                  defaultValue={[0, 1750]}
                  max={1750}
                  step={5}
                  className="w-full"
                />
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>0 EGP</span>
                  <span>1750 EGP</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brand Filter */}
          <AccordionItem value="brand">
            <AccordionTrigger>Brand</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['Nike', 'Adidas', 'Puma'].map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox id={brand} />
                  <Label htmlFor={brand} className="text-sm">
                    {brand}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Size Filter */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <Checkbox id={size} />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          {/* Size Filter */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <Checkbox id={size} />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          {/* Size Filter */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <Checkbox id={size} />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          {/* Size Filter */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <Checkbox id={size} />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          {/* Size Filter */}
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <div key={size} className="flex items-center gap-2">
                  <Checkbox id={size} />
                  <Label htmlFor={size} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
