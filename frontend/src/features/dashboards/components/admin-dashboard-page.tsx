"use client";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  UserCheck,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/auth-context";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { getAdminDashboard } from "../dashboards.api";
import { SummaryCard } from "./summary-card";

export function AdminDashboardPage() {
  const user = useCurrentUser();
  const query = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
  });
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        description={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  const cards = [
    {
      label: "Total users",
      value: query.data.totalUsers,
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Teachers",
      value: query.data.totalTeachers,
      href: "/admin/users?role=Teacher",
      icon: UserCheck,
    },
    {
      label: "Students",
      value: query.data.totalStudents,
      href: "/admin/users?role=Student",
      icon: GraduationCap,
    },
    {
      label: "Courses",
      value: query.data.totalCourses,
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Subjects",
      value: query.data.totalSubjects,
      href: "/admin/subjects",
      icon: Library,
    },
    {
      label: "Published assignments",
      value: query.data.publishedAssignments,
      href: "/admin/assignments?status=Published",
      icon: FileText,
    },
    {
      label: "Submissions",
      value: query.data.totalSubmissions,
      href: "/admin/submissions",
      icon: ClipboardCheck,
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title={`Welcome, ${user.firstName}`}
        description="Monitor academic setup and activity across the system."
      />
      <section
        aria-label="System summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>
    </div>
  );
}
