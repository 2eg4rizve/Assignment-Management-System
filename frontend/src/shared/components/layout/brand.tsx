import { GraduationCap } from "lucide-react";

import { cn } from "@/shared/lib/cn";

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            Assignment Management
          </span>
          <span className="text-muted-foreground block text-xs">
            Academic workspace
          </span>
        </span>
      )}
    </div>
  );
}
