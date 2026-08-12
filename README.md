# Assignment & Submission Management System

A full-stack, role-based school/college application built for the Assistant Software Engineer recruitment project. Admins manage academic data and users, teachers manage assignments and grading, and students view and submit assigned work.

## Main features

- JWT authentication with rotating refresh tokens and backend role authorization
- Admin management for users, courses, subjects, enrollments, and teacher assignments
- Draft, publish, update, close, and delete lifecycle for assignments
- Student submission and permitted resubmission before the deadline
- Teacher review, status changes, marks, and feedback
- Role-specific dashboards and data visibility
- Automatic student IDs based on course/year/semester and global teacher IDs
- Pagination, search, advanced filters, sorting, and responsive UI
- Problem Details error responses, structured logging, health checks, and Swagger
- PostgreSQL migrations and idempotent development seed data

## Technology stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, and Zod
- Backend: ASP.NET Core Web API on .NET 9, C#, Entity Framework Core, ASP.NET Core Identity, AutoMapper, and Swagger/OpenAPI
- Database: PostgreSQL
- Testing: xUnit, ASP.NET Core integration tests, Vitest, Testing Library, and Playwright

## Project structure

```text
backend/
  src/AssignmentManagement.Domain          Domain entities and business rules
  src/AssignmentManagement.Application     DTOs, contracts, services, and mappings
  src/AssignmentManagement.Infrastructure  Identity, EF Core, repositories, migrations
  src/AssignmentManagement.Api             Controllers, authorization, middleware
  tests/                                   Unit and integration tests
frontend/
  src/app/                                 Next.js routes and API proxy handlers
  src/features/                            Feature modules
  src/shared/                              Shared UI, API, and utilities
  tests/e2e/                               Browser workflows
ai_docs/                                   Project and API documentation
```

## Prerequisites

- .NET SDK 9
- PostgreSQL
- Node.js 24 LTS and npm 11+

## Database and backend setup

Create an empty PostgreSQL database named `assignment_management_dev`. Tables do not need to be created manually; the API applies the checked-in EF Core migrations at startup.

From the repository root in PowerShell:

```powershell
$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=assignment_management_dev;Username=postgres;Password=<your-postgres-password>'
$env:Jwt__Secret='replace-with-a-local-secret-at-least-32-bytes'
dotnet restore backend/AssignmentManagement.sln
dotnet run --project backend/src/AssignmentManagement.Api
```

Command Prompt equivalents:

```bat
set ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=assignment_management_dev;Username=postgres;Password=<your-postgres-password>
set Jwt__Secret=replace-with-a-local-secret-at-least-32-bytes
dotnet restore backend\AssignmentManagement.sln
dotnet run --project backend\src\AssignmentManagement.Api
```

Development URLs:

- API: `https://localhost:7096` or `http://localhost:5096`
- Swagger: `https://localhost:7096/swagger`
- Health check: `https://localhost:7096/health`

For a trusted local HTTPS certificate, run `dotnet dev-certs https --trust` once.

## Frontend setup

PowerShell:

```powershell
Set-Location frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Command Prompt:

```bat
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The example environment points the Next.js server to the HTTP API URL. Change `API_BASE_URL` in `.env.local` to `https://localhost:7096/api/v1` if HTTPS proxying is preferred.

## Demo credentials

Development seeding is enabled by `appsettings.Development.json`. All three accounts use password `Demo123!`:

| Role | Email |
| --- | --- |
| Admin | `admin@assignment.local` |
| Teacher | `teacher@assignment.local` |
| Student | `student@assignment.local` |

These are local demonstration credentials only. Disable demo seeding and replace all secrets outside development.

## Running tests and quality checks

Backend, from the repository root:

```powershell
dotnet build backend/AssignmentManagement.sln
dotnet test backend/AssignmentManagement.sln
```

Frontend, from `frontend/`:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

For a complete PostgreSQL-backed mutation and cross-role denial check, start the API and run `backend/live-workflow.ps1` from the repository root.

## Environment configuration

The frontend template is committed as `frontend/.env.example`. Backend configuration can be overridden with environment variables or .NET user secrets:

```text
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Secret
Jwt__AccessTokenMinutes
Jwt__RefreshTokenDays
DemoSeed__Enabled
DemoSeed__Password
```

Do not commit production passwords, JWT secrets, API keys, `.env.local`, or user-secret files.

## Design decisions and assumptions

- A course represents the class/course scope used for enrollment and assignment visibility.
- Subjects are reusable; a teaching assignment connects one teacher, course, and subject.
- Students see only published assignments for courses in which they have an active enrollment.
- Teachers can mutate only assignments and submissions in their own teaching scope; Admin reads all assignment and submission data.
- Assignment and submission state transitions, deadlines, resubmission permission, grading visibility, and optimistic concurrency are enforced by the backend.
- Student IDs use normalized course code + two-digit admission year + two-digit semester + two-digit sequence, for example `C263001`.
- Teacher IDs use one global sequence, for example `teacher000001`.
- Generated IDs have database unique indexes and PostgreSQL transaction locks prevent concurrent duplicate allocation.

## Known limitations

- Answers and assignment descriptions are plain text; rich text and file uploads are out of scope.
- Enrollment changes use deactivation followed by a new enrollment rather than editing the student/course pair.
- Email delivery, notifications, realtime updates, and analytics charts are not included.
- Swagger is enabled only in the Development environment.
- Production deployment, monitoring, backup policy, and a manual WCAG/screen-reader audit depend on the target hosting environment.

More detailed documents are available in [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md), and [ai_docs/API_DOCUMENTATION.md](ai_docs/API_DOCUMENTATION.md).
