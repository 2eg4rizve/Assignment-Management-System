import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UsersPage } from "./users-page";

const replace = vi.fn();
const getUsers = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../users.api", () => ({
  createUser: vi.fn(),
  getUsers: (...args: unknown[]) => getUsers(...args),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>,
  );
}

describe("UsersPage", () => {
  it("renders a paged user list", async () => {
    getUsers.mockResolvedValue({
      hasNextPage: false,
      hasPreviousPage: false,
      items: [
        {
          createdAtUtc: "2026-08-01T00:00:00Z",
          email: "amina@example.com",
          fullName: "Amina Rahman",
          id: "user-1",
          isActive: true,
          roles: ["Teacher"],
        },
      ],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });

    renderPage();

    expect(await screen.findByText("Amina Rahman")).toBeVisible();
    expect(screen.getByText("Teacher")).toBeVisible();
    expect(screen.getByText("Active")).toBeVisible();
  });

  it("stores search filters in the URL", async () => {
    getUsers.mockResolvedValue({
      hasNextPage: false,
      hasPreviousPage: false,
      items: [],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
    });
    renderPage();

    await userEvent.type(screen.getByRole("searchbox"), "amina");

    expect(replace).toHaveBeenLastCalledWith("/admin/users?search=amina");
  });
});
