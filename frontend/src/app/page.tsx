import { ArrowRight, Blocks, Database, ShieldCheck } from "lucide-react";

const foundationItems = [
  {
    title: "Feature-based structure",
    description:
      "Business modules stay focused, discoverable, and independent.",
    icon: Blocks,
  },
  {
    title: "Typed API boundary",
    description:
      "Server-side integration keeps backend access consistent and safe.",
    icon: Database,
  },
  {
    title: "Role-aware security",
    description:
      "Admin, Teacher, and Student workflows build on one session model.",
    icon: ShieldCheck,
  },
] as const;

export default function HomePage() {
  return (
    <main className="bg-muted/35 min-h-svh px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <section className="max-w-3xl space-y-6">
          <p className="bg-background text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500" />
            Frontend foundation ready
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Assignment Management System
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-8">
              A clean Next.js foundation for reliable academic workflows across
              administrators, teachers, and students.
            </p>
          </div>
          <div className="text-foreground flex items-center gap-2 text-sm font-medium">
            Next module: shared UI and API contracts
            <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </section>

        <section
          aria-label="Frontend architecture foundations"
          className="grid gap-4 md:grid-cols-3"
        >
          {foundationItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm"
              >
                <div className="bg-primary text-primary-foreground mb-5 flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 leading-7">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
