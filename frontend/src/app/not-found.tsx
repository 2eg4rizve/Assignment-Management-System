import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-semibold">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The page you requested does not exist or is no longer available.
        </p>
        <Link className="inline-block font-medium underline" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
