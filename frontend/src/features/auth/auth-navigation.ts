import {
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  Send,
  UserCheck,
  Users,
} from "lucide-react";

import type { UserRole } from "@/shared/api/contracts";
import type { NavigationItem } from "@/shared/components/layout/navigation";

const navigationByRole: Record<UserRole, readonly NavigationItem[]> = {
  Admin: [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/courses", icon: GraduationCap, label: "Courses" },
    { href: "/admin/subjects", icon: Library, label: "Subjects" },
    {
      href: "/admin/teaching-assignments",
      icon: UserCheck,
      label: "Teaching assignments",
    },
    { href: "/admin/enrollments", icon: BookOpen, label: "Enrollments" },
  ],
  Teacher: [
    { href: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/teacher/assignments", icon: FileText, label: "Assignments" },
    {
      href: "/teacher/submissions",
      icon: ClipboardCheck,
      label: "Submissions",
    },
  ],
  Student: [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/assignments", icon: FileText, label: "Assignments" },
    { href: "/student/submissions", icon: Send, label: "My submissions" },
  ],
};

export function getNavigationForRoles(roles: readonly UserRole[]) {
  const items = roles.flatMap((role) => navigationByRole[role] ?? []);
  return items.filter(
    (item, index) =>
      items.findIndex(({ href }) => href === item.href) === index,
  );
}
