"use client";

import type { ReactNode } from "react";

import type { UserRole } from "@/shared/api/contracts";
import { UnauthorizedState } from "@/shared/components/feedback/unauthorized-state";

import { getDashboardPath } from "../auth-routing";
import { useCurrentUser } from "../auth-context";

type RoleGuardProps = {
  children: ReactNode;
  role: UserRole;
};

export function RoleGuard({ children, role }: RoleGuardProps) {
  const user = useCurrentUser();
  if (!user.roles.includes(role)) {
    return <UnauthorizedState dashboardHref={getDashboardPath(user.roles)} />;
  }

  return children;
}
