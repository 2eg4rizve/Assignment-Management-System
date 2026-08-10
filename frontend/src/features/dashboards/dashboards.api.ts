import { browserRequest } from "@/shared/api/browser-client";
import type {
  AdminDashboard,
  StudentDashboard,
  TeacherDashboard,
} from "./dashboards.types";

export function getAdminDashboard() {
  return browserRequest<AdminDashboard>("/api/dashboard/admin");
}
export function getTeacherDashboard() {
  return browserRequest<TeacherDashboard>("/api/dashboard/teacher");
}
export function getStudentDashboard() {
  return browserRequest<StudentDashboard>("/api/dashboard/student");
}
