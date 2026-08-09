import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/api-error";
import { isValidationProblemDetails } from "@/shared/api/contracts";

export function mapUserFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (error instanceof ApiError && isValidationProblemDetails(error.problem)) {
    for (const [rawField, messages] of Object.entries(error.problem.errors)) {
      const field = `${rawField.charAt(0).toLowerCase()}${rawField.slice(1)}`;
      setError(field as Path<T>, { message: messages[0] });
    }
  }

  return error instanceof Error
    ? error.message
    : "The request could not be completed.";
}
