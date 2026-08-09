import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, replace }),
}));

describe("LoginForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    replace.mockReset();
    refresh.mockReset();
  });

  it("shows client validation before sending a request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByText("Password is required.")).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a safe message for invalid credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ status: 401, title: "Unauthorized" }, { status: 401 }),
    );
    render(<LoginForm />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "teacher@assignment.local",
    );
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("The email or password is incorrect."),
    ).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
  });
});
