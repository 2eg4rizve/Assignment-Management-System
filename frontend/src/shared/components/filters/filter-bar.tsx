"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type FilterBarProps = {
  children: ReactNode;
  className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilters = [...searchParams.entries()].filter(
    ([name, value]) => name !== "page" && value,
  );

  function removeFilter(name: string) {
    const next = new URLSearchParams(searchParams);
    next.delete(name);
    next.delete("page");
    router.replace(next.size ? `?${next}` : "?");
  }

  return (
    <div
      aria-label="List filters"
      className={cn(
        "bg-card flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:flex-wrap sm:items-end",
        className,
      )}
      role="search"
    >
      {children}
      {activeFilters.length ? (
        <div className="flex w-full flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-muted-foreground text-xs font-medium">
            Active:
          </span>
          {activeFilters.map(([name, value]) => (
            <button
              className="bg-muted hover:bg-muted/70 inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs"
              key={name}
              onClick={() => removeFilter(name)}
              title={`${name}: ${value}`}
              type="button"
            >
              <span className="capitalize">{name}</span>
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
          <button
            className="text-muted-foreground hover:text-foreground ml-auto text-xs font-medium underline-offset-4 hover:underline"
            onClick={() => router.replace("?")}
            type="button"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
