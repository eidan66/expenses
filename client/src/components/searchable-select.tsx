import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SearchableSelectOption = { value: string; label: string };

type SearchableSelectProps = {
  value: string;
  onValueChange: (next: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
};

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  emptyText,
  disabled,
  className,
  searchPlaceholder = "חיפוש…",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          dir="rtl"
          className={cn(
            "w-full justify-between font-normal text-right",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "flex max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) flex-col overflow-hidden p-0"
        )}
        dir="rtl"
        align="start"
      >
        <Command
          dir="rtl"
          className="h-auto min-h-0 flex-1 flex-col overflow-hidden"
        >
          <CommandInput placeholder={searchPlaceholder} className="text-right" />
          <CommandList className="max-h-full min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  className="text-right"
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
