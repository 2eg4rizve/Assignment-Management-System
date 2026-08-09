# Assignment Management System Frontend

The frontend is a separate Next.js App Router application for the Assignment Management System. It uses TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, and Zod.

## Requirements

- Node.js 24 LTS
- npm 11 or newer
- The ASP.NET Core API running at `http://localhost:5096`

## Setup

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

`API_BASE_URL` is server-only. Do not rename it with a `NEXT_PUBLIC_` prefix or expose backend credentials in frontend environment files.

## Quality commands

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright browsers are installed separately when end-to-end work starts:

```powershell
npx playwright install chromium
npm run e2e
```

## Source organization

- `src/app`: routing, layouts, route handlers, and page composition
- `src/features`: business modules added only when implementation begins
- `src/shared`: cross-feature API, configuration, UI, and utilities
- `tests/e2e`: critical user workflows

Feature code should remain inside its owning module. Pages compose features but do not contain API or business logic.
