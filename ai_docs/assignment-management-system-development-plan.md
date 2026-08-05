# Assignment & Submission Management System — Development Plan

## 1. Purpose

This document converts the recruitment project brief into a code-ready implementation plan for a role-based school/college Assignment & Submission Management System.

The proposed stack is:

- Backend: .NET 9, ASP.NET Core Web API, C#
- Architecture: Clean Architecture with feature-based organization inside layers
- Database: PostgreSQL
- Data access: Entity Framework Core 9
- Authentication: ASP.NET Core Identity, JWT access tokens, refresh tokens, role-based authorization
- Frontend: Next.js, React, TypeScript
- Validation: FluentValidation on the backend and Zod with React Hook Form on the frontend
- API documentation: Swagger/OpenAPI
- Testing: xUnit, FluentAssertions, NSubstitute or Moq, and integration tests with PostgreSQL/Testcontainers when practical

Target submission date stated in the brief: **14 August 2026**.

---

## 2. Scope from the Requirements

### Admin

- Log in securely.
- Create, view, update, activate/deactivate, and assign roles to users.
- Manage classes/courses.
- Manage subjects.
- Assign teachers to a class/course and subject.
- Enroll students in classes/courses.
- View all assignments.
- View all submissions.
- Manage a small set of application settings if implemented.

### Teacher

- Log in securely.
- Create, update, and delete their own assignments.
- Assign an assignment to a class/course and subject they are authorized to teach.
- Set title, description, deadline, maximum marks, and submission update policy.
- Save an assignment as Draft or publish it.
- View submissions for their assignments.
- Give marks and feedback.
- Change submission status when the workflow permits it.

### Student

- Log in securely.
- View published assignments for classes/courses in which they are enrolled.
- View assignment description, subject, teacher, deadline, and maximum marks.
- Submit an answer before the deadline.
- Update a submission before the deadline when the assignment permits updates.
- View submission status, marks, and teacher feedback.

---

## 3. Explicit Assumptions and Design Decisions

These assumptions should also be summarized in the final `README.md`.

1. A **Class/Course** is represented by one `Course` entity. It may describe either a school class/section or a college course/cohort.
2. A student can be enrolled in multiple courses through `CourseEnrollment`.
3. A subject can be offered in multiple courses.
4. A teacher may teach multiple course-subject combinations. Authorization is controlled by `TeachingAssignment`.
5. Each assignment belongs to exactly one `TeachingAssignment`; therefore its teacher, course, and subject cannot become inconsistent.
6. Only published assignments are visible to students.
7. Draft assignments can be edited or deleted by their owner. A published assignment can be edited, but changes to course, subject, teacher, or maximum marks are restricted after submissions exist.
8. Hard delete is avoided for records that are referenced by history. Users, courses, subjects, and teaching assignments use active/inactive state. Assignments use soft deletion.
9. One student can have at most one submission per assignment. Updating replaces the answer content while retaining audit timestamps.
10. The first submission and every update must occur on or before the assignment deadline.
11. `AllowResubmission` controls whether an already submitted answer may be updated before the deadline.
12. Text answers are required for the minimum viable product. A file attachment feature is optional and can be added later without changing the core workflow.
13. Teachers can grade only submissions belonging to assignments they own.
14. Marks must be between zero and the assignment's maximum marks.
15. Students see marks and feedback only after the teacher publishes the grade (`Graded` status).
16. All stored timestamps use UTC. The frontend converts them to the user's local timezone.
17. New accounts are created by an Admin; public registration is disabled.
18. Email is the login identifier and must be unique.
19. JWT access tokens are short-lived. Refresh tokens are stored as hashes and can be revoked.
20. API pagination is recommended for all list endpoints even though it is optional in the brief.

---

## 4. Clean Architecture

### Dependency direction

```text
Web API  ------>  Application  ------>  Domain
   |                 ^
   +------> Infrastructure ----------> Domain

Frontend (Next.js) communicates only through the HTTP API.
```

### Backend solution structure

```text
backend/
  AssignmentManagement.sln
  src/
    AssignmentManagement.Domain/
      Common/
      Entities/
      Enums/
      Events/
      Exceptions/
    AssignmentManagement.Application/
      Abstractions/
      Common/
        Behaviors/
        Exceptions/
        Models/
        Security/
      Features/
        Auth/
        Users/
        Courses/
        Subjects/
        TeachingAssignments/
        Enrollments/
        Assignments/
        Submissions/
        Dashboard/
      DependencyInjection.cs
    AssignmentManagement.Infrastructure/
      Authentication/
      Identity/
      Persistence/
        Configurations/
        Interceptors/
        Migrations/
        Seed/
      Services/
      DependencyInjection.cs
    AssignmentManagement.Api/
      Controllers/
      Extensions/
      Middleware/
      OpenApi/
      Program.cs
      appsettings.json
      appsettings.Development.json
  tests/
    AssignmentManagement.Domain.UnitTests/
    AssignmentManagement.Application.UnitTests/
    AssignmentManagement.Api.IntegrationTests/
```

### Layer responsibilities

#### Domain

- Enterprise entities, value objects, enums, and domain rules.
- No dependency on EF Core, ASP.NET Core, Identity, or external services.
- Methods should protect invariants where practical, for example `assignment.Publish()` and `submission.Grade(...)`.

#### Application

- Use cases, DTOs, validators, authorization checks, interfaces, and mapping.
- CQRS-style commands and queries are recommended, with MediatR optional.
- Depends only on Domain and abstractions.

#### Infrastructure

- EF Core `DbContext`, PostgreSQL configuration, ASP.NET Core Identity implementation, token generation, current-user service, clock service, and database seeding.
- Implements interfaces declared in Application.

#### API

- HTTP controllers/endpoints, authentication setup, global exception handling, OpenAPI, dependency injection, and request/response serialization.
- Controllers remain thin and delegate business operations to Application use cases.

---

## 5. Core Domain Model

All primary keys use `Guid`. Database table and column naming may use `snake_case` through the PostgreSQL EF naming convention.

### Common auditable fields

Use a base entity where suitable:

```text
Id: Guid
CreatedAtUtc: DateTimeOffset
CreatedBy: Guid?
UpdatedAtUtc: DateTimeOffset?
UpdatedBy: Guid?
```

### ApplicationUser

Infrastructure Identity entity extending `IdentityUser<Guid>`.

```text
Id: Guid
FirstName: string (required, max 100)
LastName: string (required, max 100)
Email: string (Identity, required, unique)
UserName: string (normalized from email)
IsActive: bool
CreatedAtUtc: DateTimeOffset
UpdatedAtUtc: DateTimeOffset?
```

Identity manages password hashes, roles, claims, security stamps, and lockout fields. Do not put this entity in the Domain project if doing so would introduce an Identity dependency; keep it in Infrastructure and expose the current user through an Application abstraction.

### Course

```text
Id: Guid
Code: string (required, unique, max 30)
Name: string (required, max 150)
Description: string? (max 1000)
AcademicYear: string? (max 20; example: 2026)
Section: string? (max 30)
IsActive: bool
Audit fields
```

### Subject

```text
Id: Guid
Code: string (required, unique, max 30)
Name: string (required, max 150)
Description: string? (max 1000)
IsActive: bool
Audit fields
```

### TeachingAssignment

Connects one teacher to one course and one subject.

```text
Id: Guid
TeacherId: Guid -> ApplicationUser
CourseId: Guid -> Course
SubjectId: Guid -> Subject
IsActive: bool
Audit fields
```

Constraints:

- Unique index on `(TeacherId, CourseId, SubjectId)`.
- The selected user must have the Teacher role and be active.
- Course and subject must be active when the relationship is created.

### CourseEnrollment

Connects a student to a course.

```text
Id: Guid
StudentId: Guid -> ApplicationUser
CourseId: Guid -> Course
EnrolledAtUtc: DateTimeOffset
IsActive: bool
Audit fields
```

Constraints:

- Unique index on `(StudentId, CourseId)`.
- The selected user must have the Student role and be active.

### Assignment

```text
Id: Guid
TeachingAssignmentId: Guid -> TeachingAssignment
Title: string (required, max 200)
Description: string (required, max 10000)
DeadlineUtc: DateTimeOffset
MaximumMarks: decimal(7,2)
Status: AssignmentStatus (Draft, Published, Closed)
AllowResubmission: bool
PublishedAtUtc: DateTimeOffset?
IsDeleted: bool
RowVersion: concurrency token
Audit fields
```

Rules:

- Title and description are required.
- Deadline must be in the future when a new assignment is published.
- Maximum marks must be greater than zero.
- Only the owning teacher can update/publish/delete it; Admin has read-only visibility unless an explicit override is documented.
- Publishing changes `Draft` to `Published` and sets `PublishedAtUtc`.
- `Closed` can be set manually by the owning teacher, or treated as a computed UI state after the deadline.
- A draft is invisible to students.
- After any submission exists, do not allow changing `TeachingAssignmentId` or reducing maximum marks below an awarded mark.
- Use optimistic concurrency to prevent silent overwrites.

### Submission

```text
Id: Guid
AssignmentId: Guid -> Assignment
StudentId: Guid -> ApplicationUser
AnswerText: string (required, max 50000)
Status: SubmissionStatus (Submitted, UnderReview, Graded, Returned)
SubmittedAtUtc: DateTimeOffset
LastSubmittedAtUtc: DateTimeOffset
MarksAwarded: decimal(7,2)?
Feedback: string? (max 10000)
GradedAtUtc: DateTimeOffset?
GradedBy: Guid? -> ApplicationUser
RowVersion: concurrency token
Audit fields
```

Constraints and rules:

- Unique index on `(AssignmentId, StudentId)`.
- Student must have an active enrollment in the assignment's course.
- Assignment must be Published.
- Current time must not be after `DeadlineUtc`.
- Updating an existing submission requires `AllowResubmission = true` and a deadline that has not passed.
- Marks are nullable until grading and must be within `0..MaximumMarks`.
- Grade publication requires marks. Feedback may be optional.
- A student can read only their own submission.

### RefreshToken

```text
Id: Guid
UserId: Guid -> ApplicationUser
TokenHash: string
ExpiresAtUtc: DateTimeOffset
CreatedAtUtc: DateTimeOffset
RevokedAtUtc: DateTimeOffset?
ReplacedByTokenId: Guid?
```

Never store the raw refresh token in the database.

### Optional ApplicationSetting

Only implement if time permits.

```text
Id: Guid
Key: string (unique)
Value: string
Description: string?
UpdatedAtUtc: DateTimeOffset
UpdatedBy: Guid
```

Potential settings include the default page size or default resubmission policy. Avoid building a generic settings engine unless it provides real value.

---

## 6. Relationships

```text
ApplicationUser (Teacher) 1 --- * TeachingAssignment * --- 1 Course
                                      |
                                      *
                                      |
                                      1 Subject

ApplicationUser (Student) 1 --- * CourseEnrollment * --- 1 Course

TeachingAssignment 1 --- * Assignment 1 --- * Submission * --- 1 ApplicationUser (Student)

ApplicationUser (Teacher) 1 --- * Submission (GradedBy)
```

Delete behavior:

- Use `Restrict` for user, course, subject, teaching assignment, assignment, and submission relationships.
- Do not cascade-delete academic or grading history.
- Apply a global query filter only for assignment soft deletion if used; be careful that Admin reporting can explicitly include deleted records when required.

Important indexes:

- Unique normalized email and username from Identity.
- Unique `Course.Code`.
- Unique `Subject.Code`.
- Unique `TeachingAssignment(TeacherId, CourseId, SubjectId)`.
- Unique `CourseEnrollment(StudentId, CourseId)`.
- Unique `Submission(AssignmentId, StudentId)`.
- Index `Assignment(TeachingAssignmentId, Status, DeadlineUtc)`.
- Index `Submission(AssignmentId, Status)`.
- Index `Submission(StudentId, LastSubmittedAtUtc)`.

---

## 7. Enums and State Transitions

### AssignmentStatus

```text
Draft -> Published -> Closed
```

- Draft: visible only to the owning teacher and Admin.
- Published: visible to enrolled students.
- Closed: no new submission or update is accepted.
- Passing the deadline also blocks submissions even if the stored status remains Published.

### SubmissionStatus

```text
Submitted -> UnderReview -> Graded
              |              |
              +-> Returned <-+
Returned -> Submitted (only before deadline, if resubmission is allowed)
```

For a small implementation, `UnderReview` and `Returned` are useful but optional. The minimum statuses are `Submitted` and `Graded`.

---

## 8. API Conventions

Base path: `/api/v1`

### General conventions

- JSON uses camelCase.
- Dates use ISO 8601 UTC values, for example `2026-08-14T12:00:00Z`.
- IDs are GUID strings.
- List endpoints accept `pageNumber`, `pageSize`, optional `search`, filters, and sorting.
- Default page size: 20; maximum page size: 100.
- Return `201 Created` plus a location header for successful creates.
- Return `204 No Content` for successful deletes or state-only updates where no body is needed.
- Use `ProblemDetails` for all errors.
- Never return Identity entities, EF entities, password hashes, or refresh-token hashes.

### Standard error response

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/v1/assignments",
  "traceId": "00-...",
  "errors": {
    "title": ["Title is required."],
    "maximumMarks": ["Maximum marks must be greater than zero."]
  }
}
```

### Paged response

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

Recommended status mapping:

- `400 Bad Request`: request validation or malformed input.
- `401 Unauthorized`: missing, expired, or invalid authentication.
- `403 Forbidden`: authenticated but not allowed to perform the action.
- `404 Not Found`: entity not found or deliberately hidden from the caller.
- `409 Conflict`: duplicate code/email, invalid state transition, or concurrency conflict.
- `422 Unprocessable Entity`: optional for a valid payload that violates a business rule; using `400` consistently is also acceptable.
- `500 Internal Server Error`: unexpected error with no sensitive information leaked.

---

## 9. Authentication and Authorization DTOs

### `POST /api/v1/auth/login`

Access: Anonymous

Request — `LoginRequest`

```text
email: string, required, valid email
password: string, required
```

Response — `AuthResponse`

```text
accessToken: string
expiresAtUtc: DateTimeOffset
refreshToken: string (prefer an HttpOnly Secure cookie in production)
user: CurrentUserResponse
```

### `POST /api/v1/auth/refresh`

Request — `RefreshTokenRequest`

```text
refreshToken: string
```

Response: `AuthResponse`

Rotate the refresh token on every use and revoke the previous token.

### `POST /api/v1/auth/logout`

Access: Authenticated

Revokes the current refresh token and returns `204`.

### `GET /api/v1/auth/me`

Access: Authenticated

Response — `CurrentUserResponse`

```text
id: Guid
firstName: string
lastName: string
fullName: string
email: string
roles: string[]
```

### JWT claims

Include only necessary claims:

```text
sub: user id
email: user email
jti: token id
role: Admin | Teacher | Student (one or more role claims)
```

Security requirements:

- Use a long secret from environment configuration, or preferably an asymmetric signing key in production.
- Validate issuer, audience, signature, and lifetime.
- Keep access tokens short-lived (for example, 15 minutes).
- Do not store sensitive data in JWT claims.
- Configure account lockout for repeated failed logins.
- Return a generic invalid-credentials message to prevent account enumeration.

---

## 10. User Management API and DTOs

### `GET /api/v1/users`

Access: Admin

Filters: `role`, `isActive`, `search`, pagination.

Response item — `UserListItemResponse`

```text
id: Guid
fullName: string
email: string
roles: string[]
isActive: bool
createdAtUtc: DateTimeOffset
```

### `GET /api/v1/users/{id}`

Access: Admin

Response — `UserDetailResponse`

```text
id: Guid
firstName: string
lastName: string
email: string
roles: string[]
isActive: bool
createdAtUtc: DateTimeOffset
updatedAtUtc: DateTimeOffset?
```

### `POST /api/v1/users`

Access: Admin

Request — `CreateUserRequest`

```text
firstName: string, required, max 100
lastName: string, required, max 100
email: string, required, valid email, max 256
password: string, required, Identity password policy
role: Admin | Teacher | Student, required
```

Response: `UserDetailResponse`

Rules:

- Email must be unique.
- Role must be one of the supported application roles.
- Create through `UserManager`, never by assigning a password hash manually.

### `PUT /api/v1/users/{id}`

Request — `UpdateUserRequest`

```text
firstName: string
lastName: string
email: string
role: Admin | Teacher | Student
isActive: bool
```

Response: `UserDetailResponse`

### `POST /api/v1/users/{id}/reset-password`

Request — `AdminResetPasswordRequest`

```text
newPassword: string, required, Identity password policy
```

Returns `204`. This is optional but useful for demo administration.

---

## 11. Course API and DTOs

### Endpoints

```text
GET    /api/v1/courses              Admin; Teacher/Student may receive scoped lookup access
GET    /api/v1/courses/{id}         Admin or associated user
POST   /api/v1/courses              Admin
PUT    /api/v1/courses/{id}         Admin
DELETE /api/v1/courses/{id}         Admin (deactivate if referenced)
```

### `CreateCourseRequest`

```text
code: string, required, max 30
name: string, required, max 150
description: string?, max 1000
academicYear: string?, max 20
section: string?, max 30
```

### `UpdateCourseRequest`

Same fields plus:

```text
isActive: bool
```

### `CourseResponse`

```text
id: Guid
code: string
name: string
description: string?
academicYear: string?
section: string?
isActive: bool
studentCount: int
subjectTeacherCount: int
createdAtUtc: DateTimeOffset
```

---

## 12. Subject API and DTOs

### Endpoints

```text
GET    /api/v1/subjects
GET    /api/v1/subjects/{id}
POST   /api/v1/subjects              Admin
PUT    /api/v1/subjects/{id}         Admin
DELETE /api/v1/subjects/{id}         Admin (deactivate if referenced)
```

### `CreateSubjectRequest`

```text
code: string, required, max 30
name: string, required, max 150
description: string?, max 1000
```

### `UpdateSubjectRequest`

Same fields plus `isActive: bool`.

### `SubjectResponse`

```text
id: Guid
code: string
name: string
description: string?
isActive: bool
createdAtUtc: DateTimeOffset
```

---

## 13. Teacher Assignment and Enrollment APIs

### Teaching assignments

```text
GET    /api/v1/teaching-assignments
POST   /api/v1/teaching-assignments              Admin
PUT    /api/v1/teaching-assignments/{id}          Admin
DELETE /api/v1/teaching-assignments/{id}          Admin (deactivate)
```

`CreateTeachingAssignmentRequest`:

```text
teacherId: Guid
courseId: Guid
subjectId: Guid
```

`TeachingAssignmentResponse`:

```text
id: Guid
teacher: UserSummaryResponse
course: CourseSummaryResponse
subject: SubjectSummaryResponse
isActive: bool
```

For Teacher callers, the list endpoint returns only their records. Admin can filter by teacher, course, subject, and active state.

### Student enrollments

```text
GET    /api/v1/enrollments
POST   /api/v1/enrollments              Admin
DELETE /api/v1/enrollments/{id}         Admin (deactivate)
```

`CreateEnrollmentRequest`:

```text
studentId: Guid
courseId: Guid
```

`EnrollmentResponse`:

```text
id: Guid
student: UserSummaryResponse
course: CourseSummaryResponse
enrolledAtUtc: DateTimeOffset
isActive: bool
```

---

## 14. Assignment API and DTOs

### Endpoints

```text
GET    /api/v1/assignments
GET    /api/v1/assignments/{id}
POST   /api/v1/assignments                 Teacher
PUT    /api/v1/assignments/{id}            Owning Teacher
DELETE /api/v1/assignments/{id}            Owning Teacher
POST   /api/v1/assignments/{id}/publish    Owning Teacher
POST   /api/v1/assignments/{id}/close      Owning Teacher
```

Visibility of `GET /assignments`:

- Admin: all assignments.
- Teacher: assignments they own.
- Student: only published, non-deleted assignments for active course enrollments.

Filters:

```text
status
courseId
subjectId
teacherId (Admin only)
deadlineFrom
deadlineTo
search
pageNumber
pageSize
sortBy (createdAt, deadline, title)
sortDirection (asc, desc)
```

### `CreateAssignmentRequest`

```text
teachingAssignmentId: Guid, required
title: string, required, max 200
description: string, required, max 10000
deadlineUtc: DateTimeOffset, required
maximumMarks: decimal, > 0
allowResubmission: bool
publishNow: bool
```

Validation:

- The teaching assignment exists, is active, and belongs to the current teacher.
- Course and subject are active.
- If `publishNow` is true, the deadline must be later than the current UTC time.

### `UpdateAssignmentRequest`

```text
title: string
description: string
deadlineUtc: DateTimeOffset
maximumMarks: decimal
allowResubmission: bool
rowVersion: string
```

Do not accept ownership fields casually in update requests. If reassignment is supported, implement it as a separate explicit operation with stricter checks.

### `AssignmentListItemResponse`

```text
id: Guid
title: string
courseId: Guid
courseName: string
subjectId: Guid
subjectName: string
teacherId: Guid
teacherName: string
deadlineUtc: DateTimeOffset
maximumMarks: decimal
status: AssignmentStatus
allowResubmission: bool
submissionCount: int?       (Admin/Teacher)
hasSubmitted: bool?         (Student)
studentSubmissionStatus: SubmissionStatus? (Student)
createdAtUtc: DateTimeOffset
```

### `AssignmentDetailResponse`

```text
id: Guid
title: string
description: string
course: CourseSummaryResponse
subject: SubjectSummaryResponse
teacher: UserSummaryResponse
deadlineUtc: DateTimeOffset
maximumMarks: decimal
status: AssignmentStatus
allowResubmission: bool
publishedAtUtc: DateTimeOffset?
createdAtUtc: DateTimeOffset
updatedAtUtc: DateTimeOffset?
rowVersion: string
submissionSummary: SubmissionSummaryResponse? (Student only)
```

---

## 15. Submission and Grading API and DTOs

### Student operations

```text
POST /api/v1/assignments/{assignmentId}/submission
PUT  /api/v1/assignments/{assignmentId}/submission
GET  /api/v1/assignments/{assignmentId}/submission
GET  /api/v1/my-submissions
```

### Teacher/Admin read operations

```text
GET /api/v1/assignments/{assignmentId}/submissions
GET /api/v1/submissions/{id}
```

Admin can read all. A teacher can read only submissions for owned assignments.

### Grading operations

```text
PUT  /api/v1/submissions/{id}/review-status
PUT  /api/v1/submissions/{id}/grade
```

### `CreateSubmissionRequest`

```text
answerText: string, required, max 50000
```

The student ID is always taken from the authenticated user, never from the request body.

### `UpdateSubmissionRequest`

```text
answerText: string, required, max 50000
rowVersion: string
```

Rules:

- Assignment is published and not closed.
- Deadline has not passed.
- Student is actively enrolled in the course.
- A submission exists for update.
- Assignment allows resubmission.
- A graded submission cannot be edited unless the teacher first returns it and all normal deadline rules still pass.

### `UpdateSubmissionStatusRequest`

```text
status: UnderReview | Returned
rowVersion: string
```

### `GradeSubmissionRequest`

```text
marksAwarded: decimal, required, >= 0 and <= assignment.maximumMarks
feedback: string?, max 10000
publishGrade: bool
rowVersion: string
```

If `publishGrade` is true, status becomes `Graded` and `GradedAtUtc`/`GradedBy` are set. If false, the grade can remain an internal draft in `UnderReview`; if this extra behavior complicates the implementation, require immediate publication and omit `publishGrade`.

### `SubmissionListItemResponse`

```text
id: Guid
assignmentId: Guid
assignmentTitle: string
studentId: Guid
studentName: string
studentEmail: string
status: SubmissionStatus
submittedAtUtc: DateTimeOffset
lastSubmittedAtUtc: DateTimeOffset
marksAwarded: decimal?
maximumMarks: decimal
isLate: bool
```

`isLate` should normally be false because late submissions are rejected. It is retained only if an Admin override or future late-submission policy is added.

### `SubmissionDetailResponse`

```text
id: Guid
assignment: AssignmentSummaryResponse
student: UserSummaryResponse
answerText: string
status: SubmissionStatus
submittedAtUtc: DateTimeOffset
lastSubmittedAtUtc: DateTimeOffset
marksAwarded: decimal?
maximumMarks: decimal
feedback: string?
gradedAtUtc: DateTimeOffset?
gradedByName: string?
rowVersion: string
```

For Student callers, hide internal/draft marks and feedback until status is `Graded`.

---

## 16. Dashboard API

Keep dashboard endpoints read-only and role-specific.

```text
GET /api/v1/dashboard/admin
GET /api/v1/dashboard/teacher
GET /api/v1/dashboard/student
```

### Admin dashboard response

```text
totalUsers: int
totalTeachers: int
totalStudents: int
totalCourses: int
totalSubjects: int
publishedAssignments: int
totalSubmissions: int
```

### Teacher dashboard response

```text
totalAssignments: int
publishedAssignments: int
submissionsAwaitingReview: int
recentSubmissions: SubmissionListItemResponse[]
```

### Student dashboard response

```text
openAssignments: int
dueSoonAssignments: int
submittedAssignments: int
gradedSubmissions: int
upcomingAssignments: AssignmentListItemResponse[]
```

---

## 17. Backend Cross-Cutting Concerns

### Validation

- Use FluentValidation for request/use-case validation.
- Validate shape and simple ranges first.
- Validate database-dependent business rules in the use case/handler.
- Return field-level errors in `ProblemDetails`.

### Error handling

- Add centralized exception handling using `IExceptionHandler` or exception-handling middleware.
- Map known exceptions such as validation, not found, forbidden, conflict, and concurrency to stable HTTP responses.
- Log unexpected exceptions, but never expose stack traces in production responses.

### Logging

- Use structured `ILogger` messages.
- Add a correlation/trace ID to logs and error responses.
- Log authentication failures, important state changes, and unexpected errors.
- Never log passwords, access tokens, refresh tokens, or full sensitive answers unnecessarily.

### Authorization

Use both role policies and resource ownership checks:

```text
RequireAdmin
RequireTeacher
RequireStudent
```

A role check alone is not sufficient. For example, a Teacher must also own the assignment being edited or graded.

### Concurrency

- Configure `RowVersion` as an application-managed concurrency token suitable for PostgreSQL, or use PostgreSQL's `xmin` mapping.
- Encode the version as a string in response DTOs.
- Return `409 Conflict` when an update uses an old version.

### Transactions

Use a transaction for operations that update multiple records, such as refresh-token rotation or any future bulk enrollment. A single EF `SaveChangesAsync` call is already transactional for its changes.

### CORS

- Allow only the configured frontend origin.
- Do not combine wildcard origins with credentials.

### Rate limiting

Optional but recommended for login and refresh endpoints.

### Health checks

```text
GET /health/live
GET /health/ready
```

The readiness check should verify database connectivity.

---

## 18. EF Core and PostgreSQL Plan

### DbContext

Create `ApplicationDbContext`, normally inheriting from `IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>` and implementing an Application abstraction such as `IApplicationDbContext`.

Expose `DbSet` properties for:

```text
Courses
Subjects
TeachingAssignments
CourseEnrollments
Assignments
Submissions
RefreshTokens
ApplicationSettings (optional)
```

### Entity configuration

- Use separate `IEntityTypeConfiguration<T>` classes.
- Define all string lengths, precision, indexes, foreign keys, delete behavior, concurrency tokens, and enum conversions explicitly.
- Store enums as strings for readability and safer migrations, or document the decision to store integers.
- Use `decimal(7,2)` for marks.
- Use `timestamp with time zone` through `DateTimeOffset`/UTC handling.
- Apply audit values in a `SaveChanges` interceptor using `ICurrentUserService` and `IClock`.

### Migrations

Minimum deliverables:

1. Initial Identity schema.
2. Initial academic and assignment schema.
3. Seed roles and demo data through deterministic seeding.

Useful commands (from the repository root after the solution exists):

```powershell
dotnet ef migrations add InitialCreate --project backend/src/AssignmentManagement.Infrastructure --startup-project backend/src/AssignmentManagement.Api
dotnet ef database update --project backend/src/AssignmentManagement.Infrastructure --startup-project backend/src/AssignmentManagement.Api
```

### Seed data

Seed idempotently:

- Roles: Admin, Teacher, Student.
- One demo Admin.
- One or two demo Teachers.
- Several demo Students.
- At least one Course.
- At least two Subjects.
- Teaching assignments and enrollments.
- A draft assignment, a published assignment, and representative submissions.

Demo passwords must come from development configuration/environment variables or be clearly marked non-production values. Do not hard-code production credentials.

---

## 19. Frontend Architecture

Recommended structure using the Next.js App Router:

```text
frontend/
  src/
    app/
      (auth)/
        login/page.tsx
      (dashboard)/
        layout.tsx
        admin/
        teacher/
        student/
      unauthorized/page.tsx
      not-found.tsx
      error.tsx
    components/
      ui/
      forms/
      layout/
      data-table/
    features/
      auth/
      users/
      courses/
      subjects/
      teaching-assignments/
      enrollments/
      assignments/
      submissions/
    lib/
      api-client.ts
      auth.ts
      env.ts
      query-client.ts
      validation/
    types/
      api.ts
  middleware.ts
  .env.example
```

Recommended supporting libraries:

- TanStack Query for server-state fetching, caching, mutations, and invalidation.
- React Hook Form with Zod for forms and client-side validation.
- A consistent UI component system; choose one and avoid mixing several systems.
- `fetch` wrapper or Axios for API integration. A typed `fetch` wrapper is sufficient.

### Authentication approach

Preferred:

- Store the refresh token in a Secure, HttpOnly, SameSite cookie.
- Keep the access token short-lived and avoid long-term `localStorage` storage.
- If direct browser-to-API token handling is chosen for project simplicity, clearly document the XSS tradeoff.
- Frontend route guards improve UX, but the API remains the source of authorization truth.

### Shared UI states

Every data page should deliberately handle:

- Loading state.
- Empty state.
- Validation errors.
- API/network error with retry where safe.
- Forbidden/unauthorized state.
- Success feedback.
- Confirmation before destructive actions.
- Responsive layout for mobile and desktop.

---

## 20. Frontend Pages by Role

### Public/authentication

```text
/login
/unauthorized
```

### Admin

```text
/admin/dashboard
/admin/users
/admin/users/new
/admin/users/[id]
/admin/courses
/admin/courses/[id]
/admin/subjects
/admin/teaching-assignments
/admin/enrollments
/admin/assignments
/admin/assignments/[id]
/admin/submissions
/admin/submissions/[id]
```

### Teacher

```text
/teacher/dashboard
/teacher/assignments
/teacher/assignments/new
/teacher/assignments/[id]
/teacher/assignments/[id]/edit
/teacher/assignments/[id]/submissions
/teacher/submissions/[id]/review
```

### Student

```text
/student/dashboard
/student/assignments
/student/assignments/[id]
/student/assignments/[id]/submit
/student/submissions
/student/submissions/[id]
```

### Important components

- App shell with role-aware navigation.
- Pagination and filter toolbar.
- Reusable data table.
- Assignment status badge.
- Submission status badge.
- Deadline display/countdown with overdue indication.
- Assignment form.
- Submission editor.
- Grade and feedback form.
- Confirmation dialog.
- Error summary and field errors.

---

## 21. Main Workflows

### Admin setup workflow

1. Admin logs in.
2. Admin creates Teacher and Student accounts.
3. Admin creates a Course and Subjects.
4. Admin creates `TeachingAssignment` records linking teacher + course + subject.
5. Admin enrolls students in the Course.

### Assignment workflow

1. Teacher selects one of their active teaching assignments.
2. Teacher enters title, description, deadline, maximum marks, and resubmission policy.
3. Teacher saves it as Draft.
4. Teacher reviews and publishes it.
5. Enrolled students can now see it.

### Submission workflow

1. Student opens a visible published assignment.
2. API verifies active course enrollment and deadline.
3. Student submits answer text.
4. API creates one Submission with status `Submitted`.
5. Student may update it only if the deadline has not passed and resubmission is allowed.

### Grading workflow

1. Owning teacher opens the assignment's submission list.
2. Teacher opens a submission, optionally marks it `UnderReview`.
3. Teacher enters marks and feedback.
4. API validates marks against maximum marks and verifies ownership.
5. Submission becomes `Graded`.
6. Student can view the published marks and feedback.

---

## 22. Business Rules That Must Be Tested

Highest-priority unit tests:

1. A teacher cannot create an assignment for another teacher's teaching assignment.
2. A draft assignment is not returned to a student.
3. An unenrolled student cannot access or submit an assignment.
4. A student cannot submit after the deadline.
5. A student cannot create more than one submission for an assignment.
6. A student can update before the deadline only when resubmission is allowed.
7. A student cannot read another student's submission.
8. A teacher cannot read or grade another teacher's submission.
9. Marks cannot be negative or exceed maximum marks.
10. Publishing requires a future deadline and valid assignment data.
11. A published assignment with submissions cannot be reassigned to another course/subject.
12. Deactivated users cannot log in or perform operations.
13. Duplicate course codes, subject codes, enrollments, and teaching assignments are rejected.
14. An old concurrency version produces a conflict instead of overwriting changes.
15. A student does not see an unpublished/internal grade.

### Integration tests

- Login returns JWT with correct role claims.
- Anonymous request receives `401`.
- Wrong role receives `403`.
- Admin endpoints accept Admin and reject Teacher/Student.
- Full teacher create/publish -> student submit -> teacher grade -> student view workflow.
- Database unique constraints work under concurrent/repeated requests.
- API errors follow the documented `ProblemDetails` contract.

Use the real PostgreSQL provider for important integration tests. EF Core InMemory does not reproduce relational constraints or PostgreSQL behavior accurately.

### Frontend tests

- Form validation and disabled-submit behavior.
- Role-aware navigation.
- Loading, empty, and API error states.
- Student deadline and submission status presentation.
- Teacher grade form maximum-mark validation.

At least one Playwright end-to-end happy path is a useful optional addition.

---

## 23. Configuration and Secrets

### Backend environment/configuration example

Create a committed example such as `backend/src/AssignmentManagement.Api/appsettings.Example.json` or document environment variable names:

```text
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__SigningKey
Jwt__AccessTokenMinutes
Jwt__RefreshTokenDays
Cors__AllowedOrigins__0
Seed__AdminEmail
Seed__AdminPassword
Seed__TeacherEmail
Seed__TeacherPassword
Seed__StudentEmail
Seed__StudentPassword
```

### Frontend `.env.example`

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

If using a Next.js backend-for-frontend/session approach, server-only secrets must not use the `NEXT_PUBLIC_` prefix.

Commit example files only. Ignore real `.env`, user secrets, signing keys, and real passwords.

---

## 24. Swagger/OpenAPI Requirements

- Enable Swagger in development.
- Add JWT Bearer authentication support to Swagger UI.
- Document response codes for every endpoint.
- Include validation constraints and example values where practical.
- Group/version endpoints as `v1`.
- Generate a stable OpenAPI document that can optionally produce frontend TypeScript types.

---

## 25. Recommended Implementation Order

### Phase 1 — Repository and solution foundation

1. Create `backend`, `frontend`, and `docs`/`ai_docs` structure.
2. Create the .NET solution and four backend projects.
3. Add project references following Clean Architecture dependency rules.
4. Add formatting, `.editorconfig`, `.gitignore`, and shared build settings.
5. Create the Next.js TypeScript application.
6. Add example environment/configuration files.

Exit condition: both applications compile and start with placeholder health/home pages.

### Phase 2 — Domain and persistence

1. Add enums, entities, audit model, and domain rules.
2. Add Identity user and role configuration.
3. Create `ApplicationDbContext` and entity configurations.
4. Configure PostgreSQL.
5. Add the initial migration.
6. Add idempotent role/demo data seeding.

Exit condition: a fresh PostgreSQL database can be created entirely from migrations and seed logic.

### Phase 3 — API foundation and authentication

1. Add `ProblemDetails` exception handling.
2. Add validation pipeline.
3. Add structured logging and current-user/clock services.
4. Implement login, refresh, logout, and current-user endpoints.
5. Add Admin/Teacher/Student authorization policies.
6. Configure Swagger JWT authentication and CORS.

Exit condition: all three demo users can log in and access only role-appropriate test endpoints.

### Phase 4 — Admin master data

1. Implement user management.
2. Implement courses and subjects.
3. Implement teaching assignments.
4. Implement student enrollments.
5. Add unit/integration tests for authorization and uniqueness.

Exit condition: an Admin can prepare all data needed for the assignment workflow.

### Phase 5 — Assignment lifecycle

1. Implement Teacher create, edit, delete, publish, and close use cases.
2. Implement role-scoped assignment list/detail queries.
3. Add ownership, visibility, state, deadline, and concurrency rules.
4. Add tests.

Exit condition: a Teacher can publish an assignment and only eligible Students can see it.

### Phase 6 — Submission and grading lifecycle

1. Implement create/update own submission.
2. Implement student submission history/detail.
3. Implement Teacher submission list/detail.
4. Implement review status, grading, and feedback.
5. Add the end-to-end workflow integration tests.

Exit condition: the complete publish -> submit -> grade -> view feedback flow works and is tested.

### Phase 7 — Frontend

1. Build API client, auth/session handling, route protection, and application shell.
2. Build Admin pages.
3. Build Teacher assignment and grading pages.
4. Build Student assignment and submission pages.
5. Add dashboards, responsive behavior, validation, and complete UI states.
6. Add frontend tests.

Exit condition: all mandatory workflows can be completed from the UI without Swagger.

### Phase 8 — Delivery hardening

1. Run backend unit and integration tests.
2. Run frontend lint, type-check, tests, and production build.
3. Verify a clean-database setup from documented commands.
4. Verify all demo credentials.
5. Review authorization endpoint by endpoint.
6. Review repository for secrets.
7. Finish README, assumptions, limitations, screenshots, and optional Docker setup.

Exit condition: a reviewer can clone the repository and run the complete system using only the README.

---

## 26. Definition of Done per Feature

A feature is complete only when:

- Domain/business rules are implemented.
- API authorization includes role and resource ownership/scope.
- Request validation exists.
- DTOs do not leak persistence entities.
- Correct HTTP status and `ProblemDetails` errors are returned.
- Database indexes/constraints support the rule where relevant.
- Important success and failure tests pass.
- Frontend has loading, empty, error, validation, and success states.
- Swagger/OpenAPI is accurate.
- Any new configuration is shown in an example file and README.

---

## 27. README Checklist

The final `README.md` should include:

1. Project overview.
2. Main role-based features.
3. Technology stack.
4. Architecture explanation and dependency diagram.
5. Repository/project structure.
6. Prerequisites (.NET 9 SDK, Node.js, PostgreSQL, optional Docker).
7. Backend environment setup.
8. Frontend environment setup.
9. Database migration and seed commands.
10. Backend and frontend run commands.
11. Test, lint, type-check, and build commands.
12. Swagger URL.
13. Demo credentials for Admin, Teacher, and Student.
14. Explicit assumptions and important design decisions.
15. Known limitations.
16. Optional screenshots/live URLs.
17. Confirmation that real secrets are not committed.

---

## 28. Mandatory vs Optional Scope

### Mandatory for a strong submission

- JWT login and role authorization.
- User, course, subject, teaching-assignment, and enrollment management.
- Draft/published assignments.
- Student assignment visibility by enrollment.
- Student submission/update rules.
- Teacher grading and feedback.
- PostgreSQL migrations and demo seed data.
- Meaningful unit tests for business rules and authorization.
- Responsive frontend with validation and API integration.
- Swagger, logging, centralized errors, README, and `.env.example`.

### Optional after mandatory scope is stable

- Docker Compose.
- File attachments through object storage.
- Email/in-app notifications.
- Late submission policy.
- Bulk student import/enrollment.
- Advanced analytics.
- Audit history UI.
- Password reset email flow.
- Multiple teachers per assignment.
- Rich-text editor.

Do not start optional features until the complete mandatory workflow is working and tested.

---

## 29. Risks and Practical Guardrails

- **Overbuilding Clean Architecture:** Keep interfaces only at meaningful boundaries. Do not add repositories for every entity if EF Core through an application abstraction already provides the needed behavior.
- **Role-only authorization:** Always combine roles with ownership/enrollment checks.
- **Timezone bugs:** Store UTC, compare deadlines on the server using an injected clock, and display local time clearly.
- **Identity leakage:** Keep `ApplicationUser` and Identity operations behind application interfaces; never expose the entity directly.
- **Race conditions:** Back application checks with unique database indexes and concurrency handling.
- **Frontend-only security:** Middleware and hidden buttons are UX aids; every permission must be enforced by the API.
- **Unfinishable extras:** Complete one polished end-to-end workflow before adding notifications, uploads, or analytics.
- **Database portability shortcuts:** Test important relational behavior against PostgreSQL, not only an in-memory provider.

---

## 30. First Coding Milestone

The first milestone should produce this demonstrable result:

1. PostgreSQL starts locally.
2. Migrations create the entire schema.
3. Seed logic creates Admin, Teacher, Student, Course, Subject, teaching assignment, and enrollment records.
4. All three users can log in and receive valid JWTs.
5. `/api/v1/auth/me` returns the correct user and role.
6. Swagger authorizes requests with the JWT.
7. Role-protected sample/integration tests prove that Admin, Teacher, and Student permissions are distinct.

After this foundation is passing, implement the Admin setup workflow, then assignment publishing, then submission and grading. This order reduces rework because every later feature depends on correct identity, relationships, and authorization.
