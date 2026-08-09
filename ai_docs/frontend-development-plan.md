# Frontend Development Plan

## 1. Purpose

This document is the implementation plan for the Assignment Management System frontend. The frontend will use Next.js, React, and TypeScript and will integrate with the existing ASP.NET Core API.

The main goals are:

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

## 20. Implementation Phases

### Phase 1: Project foundation

1. Create the Next.js TypeScript application under `frontend`.
2. Enable strict TypeScript, ESLint, formatting, and import aliases.
3. Configure Tailwind CSS and one UI component system.
4. Add environment validation and `.env.example`.
5. Add root layout, providers, global error page, and basic test setup.

Exit condition: development server, lint, type-check, tests, and production build pass.

### Phase 2: API and authentication

1. Implement shared API types and Problem Details parsing.
2. Implement the HTTP client and refresh-token flow.
3. Implement login, logout, current user, protected layout, and role redirects.
4. Build the role-aware application shell and navigation.
5. Add a startup health check or developer-facing error that clearly reports when the API at `API_BASE_URL` is unavailable.

Exit condition: the API health check succeeds; all demo roles can log in, refresh a session, log out, and reach only suitable navigation and routes.

### Phase 3: Shared application patterns

1. Build loading, empty, error, status, confirmation, pagination, and filter components.
2. Establish query keys and URL-based list state.
3. Establish the standard feature layout with Courses or Subjects first; both CRUD contracts are verified against PostgreSQL.

Exit condition: one list/create/edit feature demonstrates the pattern used by the rest of the application.

### Phase 4: Admin features

Implement in dependency order:

1. Users
2. Courses
3. Subjects
4. Teaching assignments
5. Enrollments
6. Admin assignment and submission views
7. Admin dashboard

Exit condition: Admin can prepare all data required for Teacher and Student workflows.

### Phase 5: Teacher features

1. Teacher dashboard
2. Assignment list and details
3. Create and edit assignment
4. Publish, close, and delete actions
5. Submission list and detail
6. Review, return, and grading forms

Exit condition: Teacher can complete the assignment lifecycle and publish a grade.

### Phase 6: Student features

1. Student dashboard
2. Visible assignment list and detail
3. Submit and allowed-resubmit flows
4. Submission history and detail
5. Published feedback and grade display

Exit condition: Student can complete the full submission workflow without using Swagger.

### Phase 7: Quality and delivery

1. Complete responsive and accessibility review.
2. Add component and end-to-end tests.
3. Verify session expiry, error, empty, and concurrency behavior.
4. Run lint, type-check, tests, and production build.
5. Document setup, commands, demo accounts, and known limitations.

Exit condition: a new developer can clone, configure, run, and understand the frontend using repository documentation.

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
