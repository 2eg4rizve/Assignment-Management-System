import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("shows the product and foundation status", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Assignment Management System" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend foundation ready")).toBeInTheDocument();
  });
});
