import { describe, expect, it } from "vitest";

import { createUserSchema } from "./users.schema";

const student = {
  email: "student@example.com",
  firstName: "Test",
  lastName: "Student",
  password: "12345678",
  role: "Student" as const,
};

describe("createUserSchema", () => {
  it("accepts student ID generation fields", () => {
    expect(
      createUserSchema.safeParse({
        ...student,
        studentCourseId: "a4a72d06-9dcc-42a1-af50-dfaf2109f9e6",
        codeYear: "26",
        codeSemester: "30",
      }).success,
    ).toBe(true);
  });

  it("requires course, year, and semester for student accounts", () => {
    expect(createUserSchema.safeParse(student).success).toBe(false);
  });

  it("requires year and semester for teacher accounts", () => {
    const teacher = { ...student, role: "Teacher" as const };
    expect(
      createUserSchema.safeParse({
        ...teacher,
        codeYear: "26",
        codeSemester: "30",
      }).success,
    ).toBe(true);
    expect(createUserSchema.safeParse(teacher).success).toBe(false);
  });
});
