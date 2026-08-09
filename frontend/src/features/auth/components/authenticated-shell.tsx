"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { AppShell } from "@/shared/components/layout/app-shell";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";

import { getNavigationForRoles } from "../auth-navigation";
import { AuthProvider } from "../auth-context";
import type { BrowserSessionResponse, CurrentUser } from "../auth.types";

type AuthenticatedShellProps = {
  children: ReactNode;
};

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/unauthorized");
          return;
        }

        if (!response.ok) {
          throw new Error("Session lookup failed.");
        }

        const session = (await response.json()) as BrowserSessionResponse;
        setUser(session.user);
      } catch {
        if (!controller.signal.aborted) {
          setFailed(true);
        }
      } finally {
        setReady(true);
      }
    }

    void loadSession();
    return () => controller.abort();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (!ready || !user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        {failed ? (
          <ErrorState
            description="The session service could not be reached. Check the backend and try again."
            onRetry={() => window.location.reload()}
          />
        ) : (
          <LoadingState rows={4} />
        )}
      </main>
    );
  }

  return (
    <AuthProvider value={user}>
      <AppShell
        navigation={getNavigationForRoles(user.roles)}
        onLogout={() => void logout()}
        user={{
          displayName: user.fullName,
          email: user.email,
          role: user.roles.join(", "),
        }}
      >
        {children}
      </AppShell>
    </AuthProvider>
  );
}
