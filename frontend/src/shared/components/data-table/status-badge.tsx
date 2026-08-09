import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/cn";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  closed: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  graded: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  inactive: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  published: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  returned: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  submitted: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  underreview: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
};

type StatusBadgeProps = {
  label?: string;
  status: string;
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const normalizedStatus = status.replaceAll(/\s|_/g, "").toLowerCase();

  return (
    <Badge
      className={cn("border-transparent", statusStyles[normalizedStatus])}
      variant="outline"
    >
      {label ?? status}
    </Badge>
  );
}
