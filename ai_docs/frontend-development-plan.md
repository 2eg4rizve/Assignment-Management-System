# Frontend Development Plan

## 1. Purpose

This document is the implementation plan for the Assignment Management System frontend. The frontend will use Next.js, React, and TypeScript and will integrate with the existing ASP.NET Core API.

The main goals are:

- Keep all frontend application code inside the top-level `frontend/` directory; do not mix frontend files into `backend/`.
- Keep the code easy to find, understand, test, and change.
- Organize business code by feature instead of by file type alone.
- Keep API, authentication, UI, and business rules separate.
- Support Admin, Teacher, and Student workflows without duplicating shared code.
- Build a realistic application with loading, empty, error, permission, and concurrency states.

This plan uses practical clean architecture. It adds boundaries where they provide value, but avoids unnecessary repositories, factories, and abstract classes in the browser.

## 2. Recommended Technology Stack

- Next.js with App Router
- React and TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui or one similar component system
- TanStack Query for server state, caching, and mutations
- React Hook Form for form state
- Zod for form and environment validation
- Vitest and React Testing Library for unit/component tests
- Playwright for critical end-to-end workflows
- ESLint and Prettier for consistent code

Use the current stable versions selected when the frontend is created. Commit the lock file and do not mix several UI component systems.

### Backend readiness

The backend and PostgreSQL development database are ready for frontend integration. Authentication, current-user lookup, and Course and Subject CRUD have been verified through the running HTTP API.

Before starting the frontend, run the API from `backend/src/AssignmentManagement.Api` and confirm that `http://localhost:5096/health` returns `200 OK`. Supply the local PostgreSQL password through `ConnectionStrings__DefaultConnection`; do not place it in frontend environment files or commit it.

The backend does not currently configure CORS. Use the backend-for-frontend approach described in this plan: Next.js route handlers or server actions call `API_BASE_URL`, and browser code calls the same-origin Next.js endpoints. Direct browser calls to port `5096` require a separate, explicitly scoped backend CORS change.

## 3. Architecture

### Dependency direction

```text
Next.js routes and layouts
          |
          v
Feature UI and feature hooks
          |
          v
Feature API functions and schemas
          |
          v
Shared HTTP client
          |
          v
ASP.NET Core API
```

Shared UI must not import from a business feature. Features may import shared code. Route files may compose features, but should contain very little business logic.

### Layer responsibilities

#### App layer

The `app` directory owns routing, layouts, route groups, loading boundaries, error boundaries, and page composition. A page should normally import a feature screen and render it.

#### Feature layer

Each business feature owns its API operations, query keys, hooks, validation schemas, types, and feature-specific UI. This is where most frontend behavior lives.

#### Shared layer

Shared code contains the HTTP client, session infrastructure, generic UI components, reusable hooks, configuration, formatting utilities, and cross-feature API types.

#### Domain rules

The API remains the source of truth for authorization and business rules. The frontend repeats only the rules needed for good user experience, such as disabling submission after a displayed deadline or validating marks before sending a grade.

## 4. Recommended File Structure

```text
frontend/
  public/
    images/
  src/
    app/
      (auth)/
        login/
          page.tsx
        layout.tsx
      (protected)/
        layout.tsx
        admin/
          dashboard/page.tsx
          users/
            page.tsx
            new/page.tsx
            [userId]/page.tsx
          courses/page.tsx
          subjects/page.tsx
          teaching-assignments/page.tsx
          enrollments/page.tsx
          assignments/
            page.tsx
            [assignmentId]/page.tsx
          submissions/
            page.tsx
            [submissionId]/page.tsx
        teacher/
          dashboard/page.tsx
          assignments/
            page.tsx
            new/page.tsx
            [assignmentId]/
              page.tsx
              edit/page.tsx
              submissions/page.tsx
          submissions/
            [submissionId]/review/page.tsx
        student/
          dashboard/page.tsx
          assignments/
            page.tsx
            [assignmentId]/page.tsx
          submissions/
            page.tsx
            [submissionId]/page.tsx
        profile/page.tsx
      unauthorized/page.tsx
      error.tsx
      global-error.tsx
      not-found.tsx
      layout.tsx
      page.tsx
      providers.tsx
      globals.css
    features/
      auth/
        api/
          auth.api.ts
        components/
          login-form.tsx
        hooks/
          use-current-user.ts
          use-login.ts
          use-logout.ts
        schemas/
          auth.schema.ts
        types/
          auth.types.ts
        index.ts
      users/
        api/
        components/
        hooks/
        schemas/
        types/
        index.ts
      courses/
      subjects/
      teaching-assignments/
      enrollments/
      assignments/
      submissions/
      dashboards/
    shared/
      api/
        api-client.ts
        api-error.ts
        query-client.ts
        query-keys.ts
      auth/
        auth-store.ts
        session.ts
        permissions.ts
        role-routes.ts
      components/
        ui/
        layout/
          app-shell.tsx
          sidebar.tsx
          topbar.tsx
        data-table/
        feedback/
          empty-state.tsx
          error-state.tsx
          loading-state.tsx
        forms/
      config/
        env.ts
        navigation.ts
        site.ts
      hooks/
        use-debounce.ts
        use-pagination.ts
      lib/
        cn.ts
        dates.ts
        formatters.ts
      types/
        api.types.ts
        common.types.ts
  tests/
    e2e/
    fixtures/
  .env.example
  middleware.ts
  next.config.ts
  package.json
  tsconfig.json
```

### Why this structure is practical

- A developer working on assignments finds almost everything under `features/assignments`.
- Route paths remain visible and understandable inside `app`.
- Generic components are separated from business-specific components.
- Feature `index.ts` files provide a small public API and discourage cross-feature deep imports.
- Folders should be created only when they contain real files. Do not create every empty folder on day one.

## 5. Naming and Import Rules

- Use `kebab-case` for file names.
- Use `PascalCase` for React component names.
- Use `camelCase` for functions and variables.
- Name API files `feature.api.ts`, schemas `feature.schema.ts`, and types `feature.types.ts`.
- Name query hooks `useAssignments`, `useAssignment`, and mutation hooks `useCreateAssignment`.
- Use the `@/` alias for imports from `src`.
- Import another feature through its public `index.ts` only when cross-feature access is necessary.
- Do not place feature-specific code in `shared` merely because two components use it.
- Avoid one large global `types.ts`, `utils.ts`, or `api.ts` file.

## 6. Routing and Layout Strategy

Use route groups to separate authentication pages from protected application pages without changing URLs.

The root page should inspect the session and redirect to:

- `/admin/dashboard` for Admin
- `/teacher/dashboard` for Teacher
- `/student/dashboard` for Student
- `/login` when unauthenticated

The protected layout renders the application shell and checks that a valid session exists. Each role section also verifies the required role. These checks improve navigation and user experience; the API still enforces every permission.

Use `loading.tsx` only where route-level loading is helpful. Use component skeletons for query-level loading. Use `error.tsx` for unexpected rendering errors, while API errors should normally be handled inside the relevant feature screen.

## 7. Authentication and Session Plan

The current API returns access and refresh tokens in JSON. The safest practical Next.js design is a small backend-for-frontend layer:

1. The login form sends credentials to a Next.js route handler or server action.
2. Next.js calls `/api/v1/auth/login`.
3. Tokens are stored in Secure, HttpOnly, SameSite cookies.
4. Browser code never reads the refresh token.
5. Server-side API requests attach the access token.
6. On expiry, one refresh operation rotates both tokens and retries the original request once.
7. Failed refresh clears the session and redirects to `/login`.

If direct browser-to-API calls are required for delivery speed, keep access tokens in memory and document the token-storage tradeoff. Do not permanently store refresh tokens in `localStorage`.

Authentication behavior must distinguish:

- `401`: session is missing or expired; try refresh once, then log out.
- `403`: the user is authenticated but lacks permission; show the unauthorized page.
- Inactive or invalid account: clear the session and show a safe login error.

Navigation is generated from the authenticated user's roles. Do not determine access from the URL alone.

## 8. API Client Design

Use one shared API client responsible for:

- API base URL configuration
- JSON serialization and deserialization
- bearer authentication
- token refresh and one safe retry
- request cancellation through `AbortSignal`
- parsing RFC 7807 `ProblemDetails`
- handling `204 No Content`
- preserving the backend `traceId` for support messages

Feature API modules should contain endpoint-specific functions, for example:

```text
features/assignments/api/assignments.api.ts
  getAssignments(params)
  getAssignment(id)
  createAssignment(input)
  updateAssignment(id, input)
  publishAssignment(id, rowVersion)
  closeAssignment(id, rowVersion)
  deleteAssignment(id, rowVersion)
```

Do not call `fetch` directly from page components. Do not add a frontend repository layer over these feature API functions; it would duplicate the HTTP client without adding a useful boundary.

## 9. Shared API Types

Create shared types for:

- `PagedResponse<T>`
- `ProblemDetails`
- `ValidationProblemDetails`
- `PaginationParams`
- `SortDirection`
- `UserRole`
- `AssignmentStatus`
- `SubmissionStatus`

Keep request and response types inside their feature. Match backend property names exactly, including `deadlineUtc`, `rowVersion`, and enum string values.

Prefer generating TypeScript types from the backend OpenAPI document when the contract is stable. Generated code should live in a clearly marked folder and should not contain hand-written business logic.

## 10. Server State with TanStack Query

Use TanStack Query only for server state. Keep local form fields, dialog state, and temporary filters in component or URL state.

Query keys must be consistent:

```text
['assignments', 'list', filters]
['assignments', 'detail', assignmentId]
['submissions', 'list', filters]
['submissions', 'detail', submissionId]
['dashboard', role]
```

After a mutation:

- Update the cache directly when the response contains the complete updated record.
- Otherwise invalidate the smallest relevant query set.
- Save the newest `rowVersion` returned by the API.
- Do not invalidate every query in the application.

List filters and pagination should live in URL search parameters so pages are bookmarkable and browser Back/Forward works correctly. Debounce search input before updating the URL.

## 11. Forms and Validation

Use React Hook Form with a Zod schema located in the owning feature. Client validation should mirror user-facing backend constraints such as required fields, maximum lengths, positive marks, email format, and valid deadlines.

The backend remains authoritative. Map backend validation errors to matching form fields. Show non-field business errors in a form-level alert.

All mutation forms must:

- Disable repeated submission while pending.
- Preserve entered values when a request fails.
- Show field and form-level errors.
- Show success feedback.
- Warn before abandoning meaningful unsaved changes where practical.
- Use the latest `rowVersion` for concurrent records.

## 12. Role-Based Screens

### Shared authentication

- Login page
- Unauthorized page
- Session expiry handling
- Logout action
- Profile summary

### Admin

- Dashboard summary cards
- User list, filters, create/edit form, activation, role assignment, and password reset
- Course list and create/edit/deactivate dialogs
- Subject list and create/edit/deactivate dialogs
- Teaching assignment list and management form
- Enrollment list and management form
- Read-only assignment and submission views

### Teacher

- Dashboard with assignment and review counts
- Assignment list with status, course, subject, deadline, and submission count
- Create, edit, publish, close, and draft-delete flows
- Assignment details and submission list
- Submission review, return, grade, and feedback flow

### Student

- Dashboard with open, due-soon, submitted, and graded counts
- Visible assignment list and details
- Answer submission and allowed resubmission
- Own submission history and detail
- Published marks and feedback

## 13. Reusable UI Components

Build generic components only after their repeated behavior is understood:

- `AppShell`
- Role-aware `Sidebar`
- `PageHeader`
- `DataTable`
- `Pagination`
- `FilterBar`
- `SearchInput`
- `StatusBadge`
- `ConfirmDialog`
- `FormField`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `ProblemDetailsAlert`

Assignment forms, grade forms, enrollment forms, and similar business components remain in their feature folders.

## 14. Real-World UI States

Every list and detail page must deliberately support:

- Initial loading
- Background refresh
- Empty results
- No search results
- API/network failure
- Unauthorized or forbidden response
- Missing record
- Successful mutation
- Pending mutation
- Stale concurrency version

For a `409 Conflict` caused by `rowVersion`, explain that another update occurred, reload the record, and let the user review before submitting again. Never silently overwrite newer data.

Display all backend UTC timestamps in the user's local timezone, including the timezone name or offset where deadlines could be misunderstood. Deadline enforcement still belongs to the server.

## 15. Accessibility and Responsive Design

- Build keyboard-accessible navigation, dialogs, menus, tables, and forms.
- Give every input a visible label and connect error text with ARIA attributes.
- Do not communicate status using color alone.
- Maintain visible focus styles.
- Use semantic headings and landmarks.
- Meet WCAG AA color contrast.
- On small screens, convert wide tables into cards or allow deliberate horizontal scrolling.
- Test core workflows at mobile, tablet, and desktop widths.

## 16. Security Requirements

- Treat frontend role guards as user experience only; trust API authorization.
- Prefer HttpOnly cookies for tokens.
- Never log passwords, access tokens, refresh tokens, or complete student answers.
- Validate environment variables at startup.
- Do not expose server-only configuration through `NEXT_PUBLIC_` variables.
- Avoid rendering unsanitized HTML. Store and render assignment/submission content as plain text unless a reviewed sanitizer is introduced.
- Configure a Content Security Policy and other security headers before production.
- Do not show internal API error details or stack traces.

## 17. Performance Guidelines

- Prefer Server Components for static layout and initial server-rendered composition.
- Add `'use client'` only to interactive boundaries.
- Lazy-load heavy editors or charts only if they are actually introduced.
- Use server pagination for lists.
- Avoid large global context providers and unnecessary global state.
- Use `next/image` for real image assets.
- Measure before adding memoization.

## 18. Testing Strategy

### Unit tests

Test pure utilities, date formatting, permission helpers, schema rules, and Problem Details parsing.

### Component tests

Test important forms and screens with mocked network responses:

- Login validation and failure
- Role-aware navigation
- Assignment form validation
- Student submission deadline states
- Grade validation against maximum marks
- Loading, empty, error, and conflict states

### End-to-end tests

At minimum, automate these workflows with Playwright against a real test API/database:

1. Admin logs in and manages required academic setup.
2. Teacher creates and publishes an assignment.
3. Student sees and submits the assignment.
4. Teacher grades the submission.
5. Student sees published marks and feedback.

Also test that each role cannot open another role's protected pages.

## 19. Environment and Configuration

Suggested `.env.example`:

```text
API_BASE_URL=http://localhost:5096/api/v1
NEXT_PUBLIC_APP_NAME=Assignment Management System
```

`API_BASE_URL` should remain server-only when the backend-for-frontend approach is used. If the browser calls the API directly, use a public base URL and configure backend CORS for the exact frontend origin.

Validate configuration in `src/shared/config/env.ts` and fail early with a useful message when required values are missing.

## 20. Dependency-Ordered Module Checklist

This checklist is the source of truth for frontend progress. Work on one module at a time unless two items are explicitly independent. Do not mark an item complete merely because files exist.

Checklist rules:

- `[ ]` means not verified.
- `[x]` means implemented and all checks listed for that item passed.
- Complete dependencies before starting a dependent module.
- Update this document in the same change that completes a checklist item.
- Record a short note under an item when work is intentionally deferred or blocked.
- Do not mark a module complete while lint, type-check, relevant tests, or production build are failing.

### Dependency map

```text
M00 Repository boundary
  -> M01 Next.js foundation
    -> M02 Shared UI and application shell
    -> M03 API client and contracts
      -> M04 Authentication and authorization
        -> M05 Admin academic setup
          -> M06 Teaching assignments and enrollments
            -> M07 Assignment lifecycle
              -> M08 Student submissions
                -> M09 Teacher review and grading
                  -> M10 Dashboards
                    -> M11 End-to-end quality and delivery
```

### M00 — Frontend repository boundary

Dependencies: none.

- [x] Keep the application in the top-level `frontend/` directory.
- [x] Confirm that frontend source, tests, configuration, and assets do not leak into `backend/`.
- [x] Add a frontend-specific `.gitignore` only when the root ignore rules do not cover generated files.
- [x] Document the Node.js and package-manager requirements.

Module complete when the directory boundary and development prerequisites are clear without creating unused placeholder folders.

### M01 — Next.js foundation

Dependencies: M00.

- [x] Create a Next.js App Router project with TypeScript under `frontend/`.
- [x] Enable strict TypeScript, ESLint, formatting, and the `@/` import alias.
- [x] Configure Tailwind CSS and exactly one component system.
- [x] Add environment validation and a safe `.env.example`.
- [x] Add root layout, global styles, providers, `not-found`, and global error handling.
- [x] Add Vitest, React Testing Library, and Playwright foundations.
- [x] Verify development server startup.
- [x] Verify lint, type-check, unit tests, and production build.

Module complete when a fresh clone can install dependencies and run the empty application using documented commands.

### M02 — Shared UI and application shell

Dependencies: M01. Can progress in parallel with M03 after M01.

- [x] Define design tokens for color, typography, spacing, radius, and elevation.
- [x] Build accessible Button, Input, Select, Dialog, Table, Badge, and feedback primitives.
- [x] Build `AppShell`, responsive sidebar, top bar, page header, and mobile navigation.
- [x] Build loading, empty, error, unauthorized, and confirmation states.
- [x] Add reusable pagination, filter bar, search input, and status badge patterns.
- [x] Test keyboard navigation, focus behavior, and representative mobile layouts.

Module complete when feature screens can be composed without inventing new layout or feedback patterns.

### M03 — API client and shared contracts

Dependencies: M01. Can progress in parallel with M02 after M01.

- [x] Add server-only `API_BASE_URL` validation.
- [x] Implement the shared HTTP client with JSON and `204 No Content` handling.
- [x] Parse RFC 7807 `ProblemDetails` and preserve `traceId`.
- [x] Define pagination, role, status, and shared API types.
- [x] Support `AbortSignal`, request timeouts, and one controlled retry where appropriate.
- [x] Add an API health check with a clear developer-facing failure message.
- [x] Unit-test response parsing and error mapping.

Module complete when typed requests can reach the backend through Next.js server code without direct browser CORS dependency.

### M04 — Authentication and authorization

Dependencies: M02 and M03.

- [x] Implement same-origin login through a Next.js route handler or server action.
- [x] Store access and refresh tokens in Secure, HttpOnly, SameSite cookies.
- [x] Implement current-user lookup, token refresh with rotation, and one safe retry.
- [x] Implement logout and reliable cookie cleanup.
- [x] Add protected layouts, role redirects, and the unauthorized page.
- [x] Generate navigation from authenticated roles.
- [x] Verify Admin, Teacher, and Student demo logins.
- [x] Test expired session, invalid credentials, `401`, and `403` behavior.

Module complete when every demo role can log in, refresh, navigate only to appropriate sections, and log out without exposing tokens to browser JavaScript.

### M05 — Admin users, courses, and subjects

Dependencies: M04.

- [x] Implement user list, filters, create/edit, activation, role assignment, and password reset.
- [x] Implement Course list, detail, create, edit, and delete/deactivation flows.
- [ ] Implement Subject list, detail, create, edit, and delete/deactivation flows.
- [ ] Use URL-backed filters and server pagination.
- [ ] Map backend validation and conflict errors to forms.
- [ ] Cover loading, empty, error, success, and pending states.
- [ ] Add component tests for representative list and mutation flows.

Module complete when an Admin can manage the foundational records required by all later workflows.

### M06 — Teaching assignments and enrollments

Dependencies: M05.

- [ ] Implement teaching-assignment list, filters, create, edit, and delete/deactivation.
- [ ] Implement enrollment list, filters, create, edit, and delete/deactivation.
- [ ] Load Course, Subject, Teacher, and Student options through typed queries.
- [ ] Prevent duplicate submissions in the UI while treating the API as authoritative.
- [ ] Test dependency loading, conflicts, empty states, and successful mutations.

Module complete when an Admin can connect teachers and students to the academic setup needed for assignments.

### M07 — Teacher assignment lifecycle

Dependencies: M06.

- [ ] Implement Teacher assignment list and detail screens.
- [ ] Implement create and edit forms with deadline and marks validation.
- [ ] Implement publish, close, and draft-delete actions.
- [ ] Carry the latest `rowVersion` through every concurrent mutation.
- [ ] Show clear `409 Conflict` recovery and record reload behavior.
- [ ] Add Admin read-only assignment views.
- [ ] Test draft, published, closed, forbidden, and stale-version states.

Module complete when a Teacher can manage the complete assignment lifecycle without Swagger.

### M08 — Student assignment and submission workflow

Dependencies: M07.

- [ ] Implement visible assignment list and detail screens.
- [ ] Implement initial submission and allowed resubmission.
- [ ] Implement own submission history and detail.
- [ ] Display deadlines in local time with timezone context.
- [ ] Handle closed, overdue, not-enrolled, and resubmission-disabled states.
- [ ] Test submission success, validation failure, forbidden access, and deadline behavior.

Module complete when a Student can discover and submit eligible assignments end to end.

### M09 — Teacher review and grading

Dependencies: M08.

- [ ] Implement submission list, filters, and detail.
- [ ] Implement under-review, return, grade, and feedback actions.
- [ ] Validate awarded marks against assignment maximum marks.
- [ ] Use the latest submission `rowVersion` for concurrent actions.
- [ ] Add Admin read-only submission views.
- [ ] Test ownership, invalid marks, stale versions, and successful grading.

Module complete when a Teacher can review a submission and publish a valid grade and feedback.

### M10 — Role dashboards

Dependencies: M05 for Admin, M07 for Teacher, and M09 for Student completion metrics.

- [ ] Implement Admin dashboard summary cards and navigation targets.
- [ ] Implement Teacher dashboard workload and review summaries.
- [ ] Implement Student dashboard open, due-soon, submitted, and graded summaries.
- [ ] Handle loading, zero-data, partial failure, and responsive layouts.
- [ ] Verify dashboard values against the corresponding list endpoints.

Module complete when each role sees accurate, actionable summaries linked to implemented workflows.

### M11 — End-to-end quality and delivery

Dependencies: M01–M10.

- [ ] Automate the Admin academic-setup workflow in Playwright.
- [ ] Automate Teacher create/publish and Student submit workflows.
- [ ] Automate Teacher grade and Student feedback visibility.
- [ ] Verify cross-role route and API access denial.
- [ ] Complete responsive, keyboard, screen-reader, and WCAG AA review.
- [ ] Verify session expiry, network failure, empty, error, and concurrency states.
- [ ] Run lint, type-check, unit/component tests, end-to-end tests, and production build.
- [ ] Document setup, commands, environment variables, demo accounts, and known limitations.

Module complete when a new developer can clone, configure, run, test, and understand the frontend and the complete role workflow passes without manual database edits.

## 21. Definition of Done

A frontend feature is complete when:

- Its routes and role access are correct.
- Its API calls use typed requests and responses.
- Forms contain client validation and display backend validation.
- Loading, empty, error, success, and pending states exist.
- Pagination and filters are server-driven where applicable.
- Mutation cache updates are correct.
- Concurrency uses the latest `rowVersion` where required.
- Timestamps are displayed clearly in local time.
- The screen works on mobile and desktop.
- Keyboard and screen-reader basics are covered.
- Important behavior has tests.
- Lint, type-check, tests, and production build pass.

## 22. Practical Guardrails

- Do not put all components in one global `components` folder.
- Do not put API calls directly in pages or visual components.
- Do not copy backend business logic into the frontend.
- Do not use global state for data already managed by TanStack Query.
- Do not create abstractions before two or more real use cases prove they are needed.
- Do not build optional charts, notifications, uploads, or rich-text editing before the complete assignment workflow works.
- Finish one vertical feature end to end before duplicating its pattern across the application.

Following these rules gives the project clear boundaries without making a small-to-medium frontend feel like a large enterprise framework.
