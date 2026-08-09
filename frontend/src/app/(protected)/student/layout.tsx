import type { ReactNode } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="Student">{children}</RoleGuard>;
}
