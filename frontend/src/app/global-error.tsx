"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-svh place-items-center px-6 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">Something went wrong</h1>
            <p>Reload the application or try the request again.</p>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
