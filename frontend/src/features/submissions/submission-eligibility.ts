import type {
  AssignmentStatus,
  SubmissionStatus,
} from "@/shared/api/contracts";

export function getSubmissionEligibility(input: {
  assignmentStatus: AssignmentStatus;
  deadlineUtc: string;
  allowResubmission: boolean;
  submissionStatus?: SubmissionStatus;
}) {
  if (input.assignmentStatus !== "Published")
    return {
      allowed: false,
      reason: "This assignment is not open for submissions.",
    };
  if (new Date(input.deadlineUtc).getTime() <= Date.now())
    return { allowed: false, reason: "The submission deadline has passed." };
  if (input.submissionStatus === "Graded")
    return { allowed: false, reason: "A graded submission cannot be changed." };
  if (input.submissionStatus && !input.allowResubmission)
    return {
      allowed: false,
      reason: "Resubmission is not allowed for this assignment.",
    };
  return { allowed: true, reason: null };
}
