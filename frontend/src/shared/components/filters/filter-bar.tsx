import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type FilterBarProps = {
  children: ReactNode;
  className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      aria-label="List filters"
      className={cn(
        "bg-card flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-end",
        className,
      )}
      role="search"
    >
      {children}
    </div>
  );
}
