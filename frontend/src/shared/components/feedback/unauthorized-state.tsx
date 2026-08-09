import { ShieldX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/components/ui/button";

type UnauthorizedStateProps = {
  dashboardHref?: string;
};

export function UnauthorizedState({
  dashboardHref = "/",
}: UnauthorizedStateProps) {
  return (
    <section className="bg-card rounded-xl border px-6 py-12 text-center shadow-sm">
      <ShieldX
        className="text-muted-foreground mx-auto size-9"
        aria-hidden="true"
      />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Access unavailable
      </h1>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
        Your account does not have permission to open this page.
      </p>
      <Button asChild className="mt-5">
        <Link href={dashboardHref}>Return to dashboard</Link>
      </Button>
    </section>
  );
}
