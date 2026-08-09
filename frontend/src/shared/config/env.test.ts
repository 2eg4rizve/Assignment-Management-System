import { describe, expect, it } from "vitest";

import { getServerEnvironment } from "./env";

describe("getServerEnvironment", () => {
  it("accepts a valid backend API URL", () => {
    expect(
      getServerEnvironment({
        API_BASE_URL: "http://localhost:5096/api/v1",
      }),
    ).toEqual({ API_BASE_URL: "http://localhost:5096/api/v1" });
  });

  it("rejects a missing backend API URL", () => {
    expect(() => getServerEnvironment({})).toThrow(
      "Invalid server environment",
    );
  });
});
