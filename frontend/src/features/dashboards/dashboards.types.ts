import type { AssignmentListItem } from "@/features/assignments/assignments.types";
import type { SubmissionListItem } from "@/features/submissions/submissions.types";

export type AdminDashboard = {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalSubjects: number;
  publishedAssignments: number;
  totalSubmissions: number;
};
export type TeacherDashboard = {
  totalAssignments: number;
  publishedAssignments: number;
  submissionsAwaitingReview: number;
  recentSubmissions: SubmissionListItem[];
};
export type StudentDashboard = {
  openAssignments: number;
  dueSoonAssignments: number;
  submittedAssignments: number;
  gradedSubmissions: number;
  upcomingAssignments: AssignmentListItem[];
};
