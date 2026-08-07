namespace AssignmentManagement.Application.Enrollments.Models;

public sealed record EnrollmentReadModel(
    Guid Id,
    Guid StudentId,
    string StudentFullName,
    string StudentEmail,
    Guid CourseId,
    string CourseCode,
    string CourseName,
    string? AcademicYear,
    string? Section,
    DateTimeOffset EnrolledAtUtc,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
