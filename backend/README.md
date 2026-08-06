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

## Completed vertical slices

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

## Next implementation step

Implement features vertically in this order:

1. FluentValidation validators for request DTOs
2. Feature-specific repository contracts and EF implementations
3. Application service contracts and implementations
4. Authentication/JWT/refresh-token service
5. Thin API controllers
6. Identity role and demo-data seeding
7. Initial EF Core migration
8. Unit and integration tests for each workflow

Start with authentication and Admin master data, then implement assignments, submissions, and grading. Do not inject the generic repository directly into controllers.

## Commands

```powershell
dotnet restore AssignmentManagement.sln
dotnet build AssignmentManagement.sln
dotnet test AssignmentManagement.sln
dotnet run --project src/AssignmentManagement.Api
```

The checked-in connection string is development-only. Use environment variables or user secrets for real credentials:

```text
ConnectionStrings__DefaultConnection
```
