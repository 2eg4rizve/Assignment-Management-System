import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SummaryCard } from "./summary-card";

describe("SummaryCard", () => {
  it("links a readable metric to its detailed list", () => {
    render(
      <SummaryCard
        href="/admin/users"
        icon={Users}
        label="Total users"
        value={42}
      />,
    );
    expect(
      screen.getByRole("link", { name: /42 total users/i }),
    ).toHaveAttribute("href", "/admin/users");
  });
});
