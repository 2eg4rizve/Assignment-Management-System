# Assignment Management API — Frontend Guide

This document describes the API currently implemented by the backend. JSON property names use `camelCase`, enum values are serialized as strings, and all dates are ISO 8601 UTC timestamps.

## Connection

Development base URL:

```text
http://localhost:5096/api/v1
```

The API applies pending migrations and seeds development data during startup. PostgreSQL must be available using the connection string in `appsettings.Development.json`.

Development OpenAPI document:

```text
http://localhost:5096/openapi/v1.json
```

The backend does not currently configure CORS. A frontend running on another origin should use a same-origin development proxy, or CORS must be added to the backend.

### Local development startup

Run the API from `backend/src/AssignmentManagement.Api` so that the development settings are loaded from the correct content root. Do not commit a local PostgreSQL password. Override the connection string for the current terminal instead:

```powershell
$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=assignment_management_dev;Username=postgres;Password=<your-postgres-password>'
dotnet run --launch-profile http
```

Before starting frontend integration, verify:

```text
GET http://localhost:5096/health
```

A `200 OK` response confirms that the API started successfully. The development startup applies pending migrations and idempotently seeds the demo accounts and academic data.

Course and Subject list, detail, create, update, and delete operations have been verified against the local PostgreSQL development database. Temporary verification records are removed after testing.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@assignment.local` | `Demo123!` |
| Teacher | `teacher@assignment.local` | `Demo123!` |
| Student | `student@assignment.local` | `Demo123!` |

These credentials are development-only.

## Authentication

Send the access token with every protected request:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Login

`POST /auth/login` — Anonymous

```json
{
  "email": "teacher@assignment.local",
  "password": "Demo123!"
}
```

Response:

```json
{
  "accessToken": "eyJ...",
  "expiresAtUtc": "2026-08-07T17:30:00+00:00",
  "refreshToken": "...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000000",
    "firstName": "Demo",
    "lastName": "Teacher",
    "fullName": "Demo Teacher",
    "email": "teacher@assignment.local",
    "roles": ["Teacher"]
  }
}
```

### Refresh token

`POST /auth/refresh` — Anonymous

```json
{ "refreshToken": "<current-refresh-token>" }
```

Returns a new `AuthResponse`. Refresh tokens rotate: replace both stored tokens after every successful refresh.

### Logout

`POST /auth/logout` — Authenticated

```json
{ "refreshToken": "<current-refresh-token>" }
```

Returns `204 No Content`.

### Current user

`GET /auth/me` — Authenticated

Returns the `user` object shown in the login response.

### Suggested frontend token flow

1. Log in and store `accessToken`, `refreshToken`, `expiresAtUtc`, and `user`.
2. Add the bearer token to protected requests.
3. Before expiry, or after one `401`, call `/auth/refresh` once.
4. Replace both tokens and retry the original request once.
5. If refresh fails, clear the session and return to login.
6. Build navigation from `user.roles`; the server remains the authorization authority.

## Shared conventions

### Enums

```text
UserRole:         Admin | Teacher | Student
AssignmentStatus: Draft | Published | Closed
SubmissionStatus: Submitted | UnderReview | Graded | Returned
SortDirection:    Asc | Desc
AssignmentSort:   CreatedAt | Deadline | Title
```

### Pagination

List endpoints accept these common query parameters:

| Parameter | Default | Rules |
|---|---:|---|
| `pageNumber` | `1` | Minimum 1 |
| `pageSize` | `20` | 1–100 |
| `search` | — | Maximum 200 characters; only where supported |

Paged response:

```json
{
  "items": [],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 0,
  "totalPages": 0,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

### Optimistic concurrency

Assignment and submission detail/mutation responses contain `rowVersion`. Send the newest value in update, publish, close, review, and grade requests. For assignment deletion, send it as a query parameter.

If the server returns `409`, reload the record and ask the user to retry their changes.

### Errors

Business errors use RFC 7807 Problem Details:

```json
{
  "type": "about:blank",
  "title": "Resource not found",
  "status": 404,
  "detail": "Assignment with id '...' was not found.",
  "instance": "/api/v1/assignments/...",
  "traceId": "..."
}
```

Model-binding validation normally returns `ValidationProblemDetails` with an additional `errors` object keyed by field name.

| Status | Meaning |
|---:|---|
| `400` | Invalid request or business rule violation |
| `401` | Missing, expired, or invalid authentication |
| `403` | Wrong role, ownership, or enrollment scope |
| `404` | Record is absent or not visible to the caller |
| `409` | Duplicate record or stale `rowVersion` |
| `500` | Unexpected server failure; show a generic message and retain `traceId` |

## Endpoint summary

### Admin

| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/admin` | Admin dashboard |
| GET/POST | `/users` | List/create users |
| GET/PUT | `/users/{id}` | Read/update user |
| POST | `/users/{id}/reset-password` | Reset password |
| GET/POST | `/courses` | List/create courses |
| GET/PUT/DELETE | `/courses/{id}` | Read/update/deactivate course |
| GET/POST | `/subjects` | List/create subjects |
| GET/PUT/DELETE | `/subjects/{id}` | Read/update/deactivate subject |
| GET/POST | `/teaching-assignments` | List/create teacher allocation |
| GET/PUT/DELETE | `/teaching-assignments/{id}` | Read/update/deactivate allocation |
| GET/POST | `/enrollments` | List/create enrollment |
| GET/DELETE | `/enrollments/{id}` | Read/deactivate enrollment |

### Teacher

| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/teacher` | Teacher dashboard |
| GET/POST | `/assignments` | List/create owned assignments |
| GET/PUT/DELETE | `/assignments/{id}` | Read/update/delete owned assignment |
| POST | `/assignments/{id}/publish` | Publish draft |
| POST | `/assignments/{id}/close` | Close published assignment |
| GET | `/assignments/{assignmentId}/submissions` | List assignment submissions |
| GET | `/submissions/{id}` | Read owned submission |
| PUT | `/submissions/{id}/review-status` | Mark under review or return |
| PUT | `/submissions/{id}/grade` | Grade submission |

### Student

| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/student` | Student dashboard |
| GET | `/assignments` | List visible published assignments |
| GET | `/assignments/{id}` | Read visible assignment |
| GET | `/my-submissions` | List own submissions |
| GET | `/assignments/{assignmentId}/submission` | Get own submission |
| POST | `/assignments/{assignmentId}/submission` | Submit answer |
| PUT | `/assignments/{assignmentId}/submission` | Resubmit answer |

## Admin resources

### Users

`GET /users`

Query: common pagination plus `search`, `role`, and `isActive`.

List item:

```json
{
  "id": "uuid",
  "fullName": "Amina Rahman",
  "email": "amina@example.com",
  "roles": ["Teacher"],
  "isActive": true,
  "createdAtUtc": "2026-08-07T12:00:00+00:00"
}
```

`POST /users`

```json
{
  "firstName": "Amina",
  "lastName": "Rahman",
  "email": "amina@example.com",
  "password": "Password123!",
  "role": "Teacher"
}
```

`PUT /users/{id}`

```json
{
  "firstName": "Amina",
  "lastName": "Rahman",
  "email": "amina@example.com",
  "role": "Teacher",
  "isActive": true
}
```

User detail adds `firstName`, `lastName`, `fullName`, and optional `updatedAtUtc`.

`POST /users/{id}/reset-password`

```json
{ "newPassword": "NewPassword123!" }
```

Returns `204`.

### Courses

`GET /courses`

Query: common pagination plus `search`, `isActive`, and `academicYear`.

Create body:

```json
{
  "code": "CSE-101",
  "name": "Computer Fundamentals",
  "description": "Introduction to computing",
  "academicYear": "2026",
  "section": "A"
}
```

Update uses the same fields plus `isActive`.

Response:

```json
{
  "id": "uuid",
  "code": "CSE-101",
  "name": "Computer Fundamentals",
  "description": "Introduction to computing",
  "academicYear": "2026",
  "section": "A",
  "isActive": true,
  "studentCount": 20,
  "subjectTeacherCount": 3,
  "createdAtUtc": "2026-08-07T12:00:00+00:00",
  "updatedAtUtc": null
}
```

`DELETE /courses/{id}` returns `204` and performs a soft delete/deactivation behavior.

### Subjects

`GET /subjects` query: common pagination plus `search` and `isActive`.

Create body:

```json
{
  "code": "MATH-101",
  "name": "Mathematics",
  "description": "Core mathematics"
}
```

Update uses the same fields plus `isActive`.

Response fields: `id`, `code`, `name`, `description`, `isActive`, `createdAtUtc`, and `updatedAtUtc`.

### Teaching assignments

`GET /teacher/teaching-assignments` is available to Teacher accounts and returns only the current teacher's teaching assignments. It accepts the teaching-assignment list filters and is used to select a valid `teachingAssignmentId` when creating an assignment.

`GET /teaching-assignments`

Query: common pagination plus `search`, `teacherId`, `courseId`, `subjectId`, and `isActive`.

Create body:

```json
{
  "teacherId": "uuid",
  "courseId": "uuid",
  "subjectId": "uuid"
}
```

Update uses the same identifiers plus `isActive`.

Response:

```json
{
  "id": "uuid",
  "teacher": { "id": "uuid", "fullName": "Demo Teacher", "email": "teacher@assignment.local" },
  "course": { "id": "uuid", "code": "DEMO-101", "name": "Demo Course", "academicYear": "2026", "section": "A" },
  "subject": { "id": "uuid", "code": "MATH-DEMO", "name": "Mathematics" },
  "isActive": true,
  "createdAtUtc": "2026-08-07T12:00:00+00:00",
  "updatedAtUtc": null
}
```

### Enrollments

`GET /enrollments`

Query: common pagination plus `search`, `studentId`, `courseId`, and `isActive`.

Create body:

```json
{
  "studentId": "uuid",
  "courseId": "uuid"
}
```

Response contains `id`, nested `student`, nested `course`, `enrolledAtUtc`, `isActive`, `createdAtUtc`, and `updatedAtUtc`.

`DELETE /enrollments/{id}` deactivates the enrollment and returns `204`.

## Assignments

### List assignments

`GET /assignments` — Authenticated

Visibility is role-scoped:

- Admin: all assignments.
- Teacher: only assignments owned through their teaching assignments.
- Student: published assignments for active course enrollments.

Query: common pagination plus:

| Parameter | Type |
|---|---|
| `status` | `AssignmentStatus` |
| `courseId` | UUID |
| `subjectId` | UUID |
| `teacherId` | UUID; Admin only |
| `deadlineFromUtc` | ISO 8601 timestamp |
| `deadlineToUtc` | ISO 8601 timestamp |
| `sortBy` | `CreatedAt`, `Deadline`, or `Title` |
| `sortDirection` | `Asc` or `Desc` |

List item fields: `id`, `title`, course/subject/teacher IDs and names, `deadlineUtc`, `maximumMarks`, `status`, `allowResubmission`, `createdAtUtc`, plus role-specific fields:

- Admin/Teacher: `submissionCount`
- Student: `hasSubmitted`, `studentSubmissionStatus`

### Assignment detail

`GET /assignments/{id}` — Authenticated and scope-protected

Response includes nested `course`, `subject`, and `teacher`; description and lifecycle dates; `rowVersion`; and a student-only `submissionSummary` when one exists.

### Create assignment

`POST /assignments` — Teacher

```json
{
  "teachingAssignmentId": "uuid",
  "title": "Week 1 Exercise",
  "description": "Complete questions 1–10.",
  "deadlineUtc": "2026-08-14T12:00:00+00:00",
  "maximumMarks": 100,
  "allowResubmission": true,
  "publishNow": false
}
```

Returns assignment detail with `201 Created`.

### Update assignment

`PUT /assignments/{id}` — Owning Teacher

```json
{
  "title": "Week 1 Exercise",
  "description": "Updated instructions.",
  "deadlineUtc": "2026-08-15T12:00:00+00:00",
  "maximumMarks": 100,
  "allowResubmission": true,
  "rowVersion": "AAAAAA=="
}
```

### Publish, close, and delete

```http
POST /assignments/{id}/publish
POST /assignments/{id}/close
Content-Type: application/json

{ "rowVersion": "AAAAAA==" }
```

```http
DELETE /assignments/{id}?rowVersion=AAAAAA%3D%3D
```

Only drafts can be deleted. Only drafts can be published, and only published assignments can be closed.

Mutation response fields: `id`, `status`, `publishedAtUtc`, `updatedAtUtc`, and the new `rowVersion`.

## Student submissions

A student must be actively enrolled, the assignment must be published, and its deadline must not have passed. Updating additionally requires `allowResubmission`. Graded submissions cannot be edited.

### List own submissions

`GET /my-submissions`

Query: common pagination plus `assignmentId`, `studentId`, `status`, `submittedFromUtc`, `submittedToUtc`, and `sortDirection`.

### Get own submission for assignment

`GET /assignments/{assignmentId}/submission`

Returns `404` when the student has not submitted.

### Create submission

`POST /assignments/{assignmentId}/submission`

```json
{ "answerText": "My complete answer..." }
```

Answer maximum length: 50,000 characters. Returns detail with `201 Created`.

### Update submission

`PUT /assignments/{assignmentId}/submission`

```json
{
  "answerText": "My revised answer...",
  "rowVersion": "AAAAAA=="
}
```

## Teacher grading

### List submissions

`GET /assignments/{assignmentId}/submissions` — Authenticated, scope-filtered

The owning teacher sees submissions for that assignment; Admin can read all. The query supports common pagination and the submission filters listed above.

`GET /submissions` provides the same role-scoped list across assignments.

### Submission detail

`GET /submissions/{id}` — Authenticated, scope-protected

Response:

```json
{
  "id": "uuid",
  "assignment": {
    "id": "uuid",
    "title": "Week 1 Exercise",
    "deadlineUtc": "2026-08-14T12:00:00+00:00",
    "maximumMarks": 100,
    "status": "Published",
    "course": { "id": "uuid", "code": "DEMO-101", "name": "Demo Course", "academicYear": "2026", "section": "A" },
    "subject": { "id": "uuid", "code": "MATH-DEMO", "name": "Mathematics" }
  },
  "student": { "id": "uuid", "fullName": "Demo Student", "email": "student@assignment.local" },
  "answerText": "My complete answer...",
  "status": "Submitted",
  "submittedAtUtc": "2026-08-07T12:00:00+00:00",
  "lastSubmittedAtUtc": "2026-08-07T12:00:00+00:00",
  "marksAwarded": null,
  "maximumMarks": 100,
  "feedback": null,
  "gradedAtUtc": null,
  "gradedByName": null,
  "rowVersion": "AAAAAA=="
}
```

Draft marks and feedback are hidden from Student callers until status is `Graded`.

### Review status

`PUT /submissions/{id}/review-status` — Owning Teacher

```json
{
  "status": "UnderReview",
  "rowVersion": "AAAAAA=="
}
```

Allowed requested statuses: `UnderReview` and `Returned`.

### Grade

`PUT /submissions/{id}/grade` — Owning Teacher

```json
{
  "marksAwarded": 85,
  "feedback": "Good work.",
  "publishGrade": true,
  "rowVersion": "AAAAAA=="
}
```

Marks must be between zero and the assignment maximum. When `publishGrade` is `false`, the grade remains internal with status `UnderReview`; when `true`, status becomes `Graded` and the student can see marks and feedback.

## Dashboards

### Admin dashboard

`GET /dashboard/admin`

Fields: `totalUsers`, `totalTeachers`, `totalStudents`, `totalCourses`, `totalSubjects`, `publishedAssignments`, and `totalSubmissions`.

### Teacher dashboard

`GET /dashboard/teacher`

Fields: `totalAssignments`, `publishedAssignments`, `submissionsAwaitingReview`, and `recentSubmissions` (up to five items).

### Student dashboard

`GET /dashboard/student`

Fields: `openAssignments`, `dueSoonAssignments`, `submittedAssignments`, `gradedSubmissions`, and `upcomingAssignments` (up to five items). “Due soon” means within seven days.

## Suggested frontend structure

```text
src/
  api/
    client.ts              bearer token, refresh, ProblemDetails parsing
    auth.ts
    users.ts
    courses.ts
    subjects.ts
    teachingAssignments.ts
    enrollments.ts
    assignments.ts
    submissions.ts
    dashboard.ts
  auth/
    session.ts
    guards.ts
  types/
    api.ts                 shared pagination, errors, enums
    resources.ts
```

Recommended UI behavior:

- Disable mutations while a request is pending.
- After every mutation, store the returned `rowVersion` or refetch the detail.
- Treat `403` as a permissions/scope error, not as logged-out state.
- Treat `409` as either duplicate data or stale concurrency state and display `detail`.
- Use server pagination rather than filtering already-loaded pages.
- Render all timestamps in the user’s local timezone but send ISO 8601 values.
