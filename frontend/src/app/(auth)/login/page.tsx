import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from "@/features/auth/server/session";
import { Brand } from "@/shared/components/layout/brand";

const demoAccounts = [
  "admin@assignment.local",
  "teacher@assignment.local",
  "student@assignment.local",
];

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (
    cookieStore.has(accessTokenCookieName) ||
    cookieStore.has(refreshTokenCookieName)
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-muted/35 grid min-h-svh lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <Brand />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to manage assignments and coursework.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
      <aside className="bg-primary text-primary-foreground hidden items-center justify-center px-10 lg:flex">
        <div className="max-w-md space-y-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">
              Development demo
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Try every role with one password
            </h2>
            <p className="text-primary-foreground/75 mt-3 leading-7">
              Use <span className="font-semibold">Demo123!</span> with any demo
              email below.
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {demoAccounts.map((email) => (
              <li
                className="border-primary-foreground/20 rounded-lg border px-4 py-3"
                key={email}
              >
                {email}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
