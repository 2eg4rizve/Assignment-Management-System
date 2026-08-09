import type { ReactNode } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="Admin">{children}</RoleGuard>;
}
