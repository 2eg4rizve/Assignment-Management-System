import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutDashboard, Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
}));

const navigation = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
] as const;

describe("AppShell", () => {
  it("renders user context and marks the current navigation item", () => {
    render(
      <AppShell
        navigation={navigation}
        user={{
          displayName: "Demo Admin",
          email: "admin@assignment.local",
          role: "Admin",
        }}
      >
        <h1>Dashboard content</h1>
      </AppShell>,
    );

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getByText("Demo Admin")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Dashboard" })[0],
    ).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the mobile navigation with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <AppShell
        navigation={navigation}
        user={{
          displayName: "Demo Admin",
          email: "admin@assignment.local",
          role: "Admin",
        }}
      >
        <h1>Dashboard content</h1>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
