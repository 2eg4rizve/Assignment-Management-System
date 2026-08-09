import type { UserRole } from "@/shared/api/contracts";

const roleDashboardPaths: Record<UserRole, string> = {
  Admin: "/admin/dashboard",
  Teacher: "/teacher/dashboard",
  Student: "/student/dashboard",
};

export function getDashboardPath(roles: readonly UserRole[]) {
  for (const role of ["Admin", "Teacher", "Student"] as const) {
    if (roles.includes(role)) {
      return roleDashboardPaths[role];
    }
  }

  return "/unauthorized";
}
