import type { ReactNode } from "react";

import { RoleGuard } from "@/features/auth/components/role-guard";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="Teacher">{children}</RoleGuard>;
}
