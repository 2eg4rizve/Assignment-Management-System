import { describe, expect, it } from "vitest";
import { getAssignmentActions } from "./assignment-lifecycle";

describe("assignment lifecycle actions", () => {
  it("allows publish and delete only for drafts", () => {
    expect(getAssignmentActions("Draft")).toEqual({
      canClose: false,
      canDelete: true,
      canEdit: true,
      canPublish: true,
    });
  });

  it("allows closing published assignments", () => {
    expect(getAssignmentActions("Published")).toEqual({
      canClose: true,
      canDelete: false,
      canEdit: true,
      canPublish: false,
    });
  });

  it("makes closed assignments read-only", () => {
    expect(getAssignmentActions("Closed")).toEqual({
      canClose: false,
      canDelete: false,
      canEdit: false,
      canPublish: false,
    });
  });
});
