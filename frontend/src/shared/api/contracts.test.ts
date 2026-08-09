import { describe, expect, it } from "vitest";

import { isProblemDetails, isValidationProblemDetails } from "./contracts";

describe("Problem Details guards", () => {
  it("recognizes a standard problem response", () => {
    expect(isProblemDetails({ status: 404, title: "Not found" })).toBe(true);
  });

  it("recognizes validation errors", () => {
    expect(
      isValidationProblemDetails({
        errors: { email: ["Email is required."] },
        status: 400,
        title: "Validation failed",
      }),
    ).toBe(true);
  });
});
