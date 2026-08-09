"use client";

import type { UserRole } from "@/shared/api/contracts";
import { PageHeader } from "@/shared/components/layout/page-header";

import { useCurrentUser } from "../auth-context";

export function RoleDashboard({ role }: { role: UserRole }) {
  const user = useCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Signed in as ${user.email}. Your ${role.toLowerCase()} tools will appear here as each controller module is completed.`}
        eyebrow={role}
        title={`Welcome, ${user.firstName}`}
      />
      <section className="bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold">Authentication is ready</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Your session, role-aware navigation, token refresh, and logout flow
          are active.
        </p>
      </section>
    </div>
  );
}
