"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type SearchInputProps = {
  label?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function SearchInput({
  label = "Search",
  onValueChange,
  placeholder = "Search records",
  value,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          className="pr-9 pl-8"
          id={id}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={value}
        />
        {value ? (
          <Button
            aria-label="Clear search"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => onValueChange("")}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
