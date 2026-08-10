import { expect, test } from "@playwright/test";
import type { UserRole } from "../../src/shared/api/contracts";
import { mockSession } from "./helpers";

const paged = (items: unknown[]) => ({
  items,
  pageNumber: 1,
  pageSize: 20,
  totalCount: items.length,
  totalPages: items.length ? 1 : 0,
  hasPreviousPage: false,
  hasNextPage: false,
});

test("Admin can create foundational course data", async ({ page }) => {
  await mockSession(page, "Admin");
  let created = false;
  await page.route("**/api/courses?*", async (route) =>
    route.fulfill({ json: paged([]) }),
  );
  await page.route("**/api/courses", async (route) => {
    if (route.request().method() === "POST") {
      created = true;
      return route.fulfill({
        status: 201,
        json: {
          id: "course-e2e",
          code: "E2E-101",
          name: "E2E Course",
          description: "Browser workflow",
          academicYear: "2026",
          section: "A",
          isActive: true,
          studentCount: 0,
          subjectTeacherCount: 0,
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: null,
        },
      });
    }
    return route.fallback();
  });
  await page.goto("/admin/courses");
  await page.getByRole("button", { name: "Add course" }).click();
  await page
    .getByText("Course code", { exact: true })
    .locator("..")
    .getByRole("textbox")
    .fill("E2E-101");
  await page
    .getByText("Course name", { exact: true })
    .locator("..")
    .getByRole("textbox")
    .fill("E2E Course");
  await page.getByRole("button", { name: "Create course" }).click();
  await expect.poll(() => created).toBe(true);
});

test("Teacher publish, Student submit, Teacher grade, and Student feedback workflow", async ({
  page,
}) => {
  let role: UserRole = "Teacher";
  await mockSession(page, role);
  await page.unroute("**/api/auth/me");
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
  const deadline = new Date(Date.now() + 86400000).toISOString();
  const assignment = {
    id: "assignment-e2e",
    title: "E2E Assignment",
    description: "Complete the browser workflow.",
    course: {
      id: "course-1",
      code: "DEMO-101",
      name: "Demo Course",
      academicYear: "2026",
      section: "A",
    },
    subject: { id: "subject-1", code: "MATH-DEMO", name: "Mathematics" },
    teacher: {
      id: "teacher-1",
      fullName: "Demo Teacher",
      email: "teacher@assignment.local",
    },
    deadlineUtc: deadline,
    maximumMarks: 100,
    status: "Published",
    allowResubmission: true,
    publishedAtUtc: new Date().toISOString(),
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    rowVersion: "AAAAAA==",
    submissionSummary: null,
  };
  let submitted = false;
  let graded = false;
  await page.route("**/api/teacher/teaching-assignments", async (route) =>
    route.fulfill({
      json: paged([
        {
          id: "teaching-1",
          teacher: assignment.teacher,
          course: assignment.course,
          subject: assignment.subject,
          isActive: true,
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: null,
        },
      ]),
    }),
  );
  await page.route("**/api/assignments", async (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 201, json: assignment })
      : route.fulfill({ json: paged([]) }),
  );
  await page.route("**/api/assignments/assignment-e2e", async (route) =>
    route.fulfill({
      json: {
        ...assignment,
        submissionSummary: submitted
          ? {
              id: "submission-e2e",
              status: graded ? "Graded" : "Submitted",
              submittedAtUtc: new Date().toISOString(),
              lastSubmittedAtUtc: new Date().toISOString(),
              marksAwarded: graded ? 90 : null,
              feedback: graded ? "Excellent work" : null,
            }
          : null,
      },
    }),
  );
  await page.route(
    "**/api/assignments/assignment-e2e/submission",
    async (route) => {
      if (route.request().method() === "POST") submitted = true;
      return route.fulfill({
        status: route.request().method() === "POST" ? 201 : 200,
        json: {
          id: "submission-e2e",
          assignment,
          student: {
            id: "student-1",
            fullName: "Demo Student",
            email: "student@assignment.local",
          },
          answerText: "My E2E answer",
          status: graded ? "Graded" : "Submitted",
          submittedAtUtc: new Date().toISOString(),
          lastSubmittedAtUtc: new Date().toISOString(),
          marksAwarded: graded ? 90 : null,
          maximumMarks: 100,
          feedback: graded ? "Excellent work" : null,
          gradedAtUtc: graded ? new Date().toISOString() : null,
          gradedByName: graded ? "Demo Teacher" : null,
          rowVersion: "AQAAAA==",
        },
      });
    },
  );
  await page.route("**/api/submissions/submission-e2e", async (route) =>
    route.fulfill({
      json: {
        id: "submission-e2e",
        assignment,
        student: {
          id: "student-1",
          fullName: "Demo Student",
          email: "student@assignment.local",
        },
        answerText: "My E2E answer",
        status: graded ? "Graded" : "Submitted",
        submittedAtUtc: new Date().toISOString(),
        lastSubmittedAtUtc: new Date().toISOString(),
        marksAwarded: graded ? 90 : null,
        maximumMarks: 100,
        feedback: graded ? "Excellent work" : null,
        gradedAtUtc: graded ? new Date().toISOString() : null,
        gradedByName: graded ? "Demo Teacher" : null,
        rowVersion: "AQAAAA==",
      },
    }),
  );
  await page.route("**/api/submissions/submission-e2e/grade", async (route) => {
    graded = true;
    return route.fulfill({
      json: {
        id: "submission-e2e",
        status: "Graded",
        marksAwarded: 90,
        rowVersion: "AgAAAA==",
      },
    });
  });

  await page.goto("/teacher/assignments/new");
  await page.getByRole("combobox", { name: "Course and subject" }).click();
  await page.getByRole("option", { name: /DEMO-101/ }).click();
  await page
    .getByText("Title", { exact: true })
    .locator("..")
    .getByRole("textbox")
    .fill("E2E Assignment");
  await page
    .getByText("Deadline", { exact: true })
    .locator("..")
    .locator("input")
    .fill(deadline.slice(0, 16));
  await page
    .getByText("Description", { exact: true })
    .locator("..")
    .getByRole("textbox")
    .fill("Complete the browser workflow.");
  await page.getByLabel("Publish immediately").check();
  await page.getByRole("button", { name: "Create assignment" }).click();
  await expect(page).toHaveURL(/\/teacher\/assignments$/);

  role = "Student";
  await page.goto("/student/assignments/assignment-e2e");
  await page.getByLabel("Your answer").fill("My E2E answer");
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect.poll(() => submitted).toBe(true);

  role = "Teacher";
  await page.goto("/teacher/submissions/submission-e2e/review");
  await page.getByLabel(/Marks awarded/).fill("90");
  await page.getByLabel("Feedback").fill("Excellent work");
  await page.getByRole("button", { name: "Save grade" }).click();
  await expect.poll(() => graded).toBe(true);

  role = "Student";
  await page.goto("/student/submissions/submission-e2e");
  await expect(page.getByText("90 / 100")).toBeVisible();
  await expect(page.getByText("Excellent work")).toBeVisible();
});
