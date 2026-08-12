# Assignment Management Backend

.NET 9 backend scaffold for the Assignment & Submission Management System.

## Request flow

```text
Controller
  -> feature-specific IService
    -> Service
      -> feature-specific IRepository
        -> EF Core Repository
          -> ApplicationDbContext
            -> PostgreSQL
```

Controllers must remain thin. Business rules and ownership checks belong in Application services. Infrastructure contains EF Core, Identity, and external implementations.

## Projects

- `AssignmentManagement.Domain`: entities, enums, domain exceptions, and domain rules. No outer-layer dependencies.
- `AssignmentManagement.Application`: DTOs, service contracts/implementations, repository contracts, validation, and application rules.
- `AssignmentManagement.Infrastructure`: EF Core, PostgreSQL, Identity, repository implementations, migrations, and seed data.
- `AssignmentManagement.Api`: controllers, authorization, middleware, configuration, and dependency composition.
- `AssignmentManagement.UnitTests`: domain/application and architecture tests.
- `AssignmentManagement.IntegrationTests`: HTTP and PostgreSQL integration tests.

## Dependency direction

```text
Domain <- Application <- Infrastructure
              ^               ^
              +------ API ----+
```

The API references Application and Infrastructure only to compose dependencies. Domain never references another project.

## Current foundation

- Solution and project references
- Base auditable entity
- Generic repository contract and EF implementation
- Unit of Work contract and implementation
- ASP.NET Core Identity user and Identity-enabled DbContext
- PostgreSQL registration
- Application/Infrastructure dependency injection entry points
- Admin, Teacher, and Student role/policy constants
- Current-user abstraction
- Central exception handling using Problem Details
- Health endpoint at `/health`
- Architecture test protecting Domain dependencies
- Complete request and response DTO contracts for every planned feature
- Pagination, filtering, sorting, and reusable summary response models
- Domain enums serialized as readable JSON strings
- Core domain entities and assignment/submission state-transition rules
- EF Core configurations, relationships, indexes, constraints, and PostgreSQL concurrency tokens
- Shared soft deletion through `BaseEntity`, repository behavior, query filters, and filtered unique indexes
- Initial PostgreSQL migration with automatic startup migration
- Idempotent role seeding and configurable development demo data

## Completed vertical slices

### Authentication

Implemented endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Authentication uses short-lived JWT access tokens and rotating refresh tokens. Raw refresh tokens are returned only to the client; SHA-256 hashes are persisted. Invalid login attempts participate in the configured Identity lockout policy.

### Users

Implemented endpoints:

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `POST /api/v1/users/{id}/reset-password`

All endpoints are Admin-protected. Accounts and passwords are managed through ASP.NET Core Identity, while account and role changes are committed transactionally. Listing supports role, active-state, search, and pagination filters.

### Courses

```text
CoursesController
  -> ICourseService
    -> CourseService
      -> ICourseRepository
        -> CourseRepository : Repository<Course>
          -> ApplicationDbContext
```

Implemented endpoints:

- `GET /api/v1/courses`
- `GET /api/v1/courses/{id}`
- `POST /api/v1/courses`
- `PUT /api/v1/courses/{id}`
- `DELETE /api/v1/courses/{id}` (soft delete)

All endpoints are protected by the Admin policy and pass cancellation tokens through every asynchronous layer. The slice includes AutoMapper, paging, search/filtering, validation metadata, audit fields, duplicate-code protection, Unit of Work, database-side counts, and PostgreSQL error translation.

### Subjects

```text
SubjectsController
  -> ISubjectService
    -> SubjectService
      -> ISubjectRepository
        -> SubjectRepository : Repository<Subject>
          -> ApplicationDbContext
```

Implemented endpoints:

- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}`
- `POST /api/v1/subjects`
- `PUT /api/v1/subjects/{id}`
- `DELETE /api/v1/subjects/{id}` (soft delete)

All endpoints are Admin-protected and support cancellation. The slice includes AutoMapper, paging, search, active-state filtering, request validation, audit fields, normalized unique subject codes, Unit of Work, and EF Core asynchronous queries.

### Teaching assignments

Implemented endpoints:

- `GET /api/v1/teaching-assignments`
- `GET /api/v1/teaching-assignments/{id}`
- `POST /api/v1/teaching-assignments`
- `PUT /api/v1/teaching-assignments/{id}`
- `DELETE /api/v1/teaching-assignments/{id}` (soft delete)

All endpoints are Admin-protected. The slice validates active teachers, courses, and subjects; prevents duplicate teacher/course/subject combinations; and supports paging, search, and reference filters.

### Course enrollments

Implemented endpoints:

- `GET /api/v1/enrollments`
- `GET /api/v1/enrollments/{id}`
- `POST /api/v1/enrollments`
- `DELETE /api/v1/enrollments/{id}` (deactivate)

All endpoints are Admin-protected. The slice validates active students and courses, prevents duplicate student/course enrollments, and supports paging, search, and reference filters.

### Assignments

Implemented endpoints:

- `GET /api/v1/assignments`
- `GET /api/v1/assignments/{id}`
- `POST /api/v1/assignments`
- `PUT /api/v1/assignments/{id}`
- `DELETE /api/v1/assignments/{id}` (draft only)
- `POST /api/v1/assignments/{id}/publish`
- `POST /api/v1/assignments/{id}/close`

Assignment reads are scoped by role: Admin sees all records, Teacher sees owned records, and Student sees published assignments for active course enrollments. Mutations enforce teacher ownership and optimistic concurrency.

## Implementation status

The planned authentication, Admin master-data, assignment, submission, review, grading,
dashboard, filtering, Swagger, migration, seed-data, and automated-test slices are implemented.
The root README contains the complete evaluator setup and submission instructions.

## Commands

```powershell
dotnet restore AssignmentManagement.sln
dotnet build AssignmentManagement.sln
dotnet test AssignmentManagement.sln
dotnet run --project src/AssignmentManagement.Api
```

## Docker Compose

The repository-level Compose stack runs PostgreSQL, this API, and the frontend.
From the repository root:

```powershell
Copy-Item backend/.env.docker.example backend/.env
Copy-Item frontend/.env.docker.example frontend/.env
docker compose up --build
```

The API is then available at `http://localhost:5096`, while containers connect
to PostgreSQL using the internal hostname `db`. See the root README for health
endpoints, demo credentials, and lifecycle commands.

On startup, the API applies pending migrations and ensures the `Admin`, `Teacher`, and
`Student` roles exist. Development demo seeding is controlled by the `DemoSeed`
configuration section. The checked-in development configuration creates these users:

```text
admin@assignment.local
teacher@assignment.local
student@assignment.local
```

They use the development-only password configured at `DemoSeed:Password`. Override or
disable this configuration outside local development.

The checked-in connection string is development-only. Use environment variables or user secrets for real credentials:

```text
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Secret
Jwt__AccessTokenMinutes
Jwt__RefreshTokenDays
```

`backend/.env.example` contains values for running the API directly against a
database on `localhost`. ASP.NET Core does not load `.env` files automatically;
set these values in the process environment, launch profile, hosting platform,
or .NET user secrets.

`backend/.env.docker.example` contains the Docker network configuration. Copy it
to `backend/.env`; Compose injects that file into both the API and PostgreSQL
containers through `env_file`.
