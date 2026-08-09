"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          We could not load this page
        </h1>
        <p className="text-muted-foreground">
          Try the request again. If it still fails, contact support with the
          error reference.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
        <button
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
