"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { workshops, categories } from "./workshopsData";

interface WorkshopSelectorProps {
  selectedIds: string[];
  onChange: (id: string, checked: boolean) => void;
  disabled?: boolean;
}

export function WorkshopSelector({ selectedIds, onChange, disabled }: WorkshopSelectorProps) {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-primary border-b border-border pb-1">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshops
              .filter((w) => w.category === category)
              .map((workshop) => {
                const isSelected = selectedIds.includes(workshop.id);
                return (
                  <div key={workshop.id} className="flex items-start space-x-3 space-y-0">
                    <Checkbox
                      id={workshop.id}
                      checked={isSelected}
                      onCheckedChange={(checked) => onChange(workshop.id, !!checked)}
                      disabled={disabled && !isSelected}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={workshop.id}
                        className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors"
                      >
                        {workshop.name}
                      </Label>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
