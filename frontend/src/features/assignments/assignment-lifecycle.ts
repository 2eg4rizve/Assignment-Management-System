import type { AssignmentStatus } from "@/shared/api/contracts";

export function getAssignmentActions(status: AssignmentStatus) {
  return {
    canClose: status === "Published",
    canDelete: status === "Draft",
    canEdit: status !== "Closed",
    canPublish: status === "Draft",
  };
}
