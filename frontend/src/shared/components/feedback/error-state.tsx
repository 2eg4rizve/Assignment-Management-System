"use client";

import { CircleAlert, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type ErrorStateProps = {
  description?: string;
  onRetry?: () => void;
  title?: string;
  traceId?: string;
};

export function ErrorState({
  description = "The request could not be completed. Try again in a moment.",
  onRetry,
  title = "Unable to load data",
  traceId,
}: ErrorStateProps) {
  return (
    <section
      aria-live="polite"
      className="border-destructive/20 bg-destructive/5 rounded-xl border px-6 py-10 text-center"
      role="alert"
    >
      <CircleAlert
        className="text-destructive mx-auto size-8"
        aria-hidden="true"
      />
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
        {description}
      </p>
      {traceId ? (
        <p className="text-muted-foreground mt-2 text-xs">
          Reference: {traceId}
        </p>
      ) : null}
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry} variant="outline">
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </section>
  );
}
