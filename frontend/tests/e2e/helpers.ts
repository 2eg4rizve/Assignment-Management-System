import type { Page } from "@playwright/test";
import type { UserRole } from "../../src/shared/api/contracts";

export async function mockSession(page: Page, role: UserRole) {
  await page.context().addCookies([
    {
      name: "ams_access_token",
      value: "e2e-token",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.route("**/api/auth/me", async (route) =>
    route.fulfill({
      json: {
        user: {
          id: `${role.toLowerCase()}-1`,
          email: `${role.toLowerCase()}@assignment.local`,
          firstName: "Demo",
          lastName: role,
          fullName: `Demo ${role}`,
          roles: [role],
          isActive: true,
        },
      },
    }),
  );
}

export const emptyDashboard = {
  Admin: {
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalSubjects: 0,
    publishedAssignments: 0,
    totalSubmissions: 0,
  },
  Teacher: {
    totalAssignments: 0,
    publishedAssignments: 0,
    submissionsAwaitingReview: 0,
    recentSubmissions: [],
  },
  Student: {
    openAssignments: 0,
    dueSoonAssignments: 0,
    submittedAssignments: 0,
    gradedSubmissions: 0,
    upcomingAssignments: [],
  },
} as const;
