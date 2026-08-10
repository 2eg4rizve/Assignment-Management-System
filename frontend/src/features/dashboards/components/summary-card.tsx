import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function SummaryCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Link
      className="bg-card focus-visible:ring-ring group rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
      href={href}
    >
      <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="text-muted-foreground group-hover:text-foreground mt-1 text-sm">
        {label}
      </p>
    </Link>
  );
}
