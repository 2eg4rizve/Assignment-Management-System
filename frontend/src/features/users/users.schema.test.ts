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
  it("accepts a structured student ID", () => {
    expect(
      createUserSchema.safeParse({ ...student, studentCode: "C263001" })
        .success,
    ).toBe(true);
  });

  it("requires a valid student ID for student accounts", () => {
    expect(createUserSchema.safeParse(student).success).toBe(false);
    expect(
      createUserSchema.safeParse({ ...student, studentCode: "CSE-26-03-001" })
        .success,
    ).toBe(false);
  });

  it("requires a structured teacher ID for teacher accounts", () => {
    const teacher = { ...student, role: "Teacher" as const };
    expect(
      createUserSchema.safeParse({ ...teacher, teacherCode: "T263001" })
        .success,
    ).toBe(true);
    expect(createUserSchema.safeParse(teacher).success).toBe(false);
    expect(
      createUserSchema.safeParse({ ...teacher, teacherCode: "T-CSE-26-001" })
        .success,
    ).toBe(false);
  });
});
