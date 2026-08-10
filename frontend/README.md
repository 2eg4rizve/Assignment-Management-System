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

## Demo accounts

With development demo seeding enabled, all accounts use `Demo123!`:

- `admin@assignment.local`
- `teacher@assignment.local`
- `student@assignment.local`

These credentials are development-only and must be replaced or disabled outside local development.

## End-to-end testing

Start PostgreSQL and the API before live browser verification:

```powershell
$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=assignment_management_dev;Username=postgres;Password=<your-password>'
$env:Logging__EventLog__LogLevel__Default='None'
dotnet run --project backend/src/AssignmentManagement.Api
```

Then run from `frontend/`:

```powershell
Copy-Item .env.example .env.local
npm run e2e
```

The browser suite covers role guards, session expiry, network failures, responsive navigation, academic setup, assignment publishing, submission, grading, and feedback. Run the workflows against the live seeded PostgreSQL database before release.

## Known limitations

- Enrollment changes require deactivation and creation of a new student-course pair because the API has no enrollment update endpoint.
- Assignment and submission content is plain text; rich text and file uploads are intentionally out of scope.
- Live database browser verification requires a locally supplied PostgreSQL password. Database credentials are never committed to frontend environment files.
- Email notifications, password-reset email delivery, charts, and realtime updates are not included.
