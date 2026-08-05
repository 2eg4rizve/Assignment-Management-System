namespace AssignmentManagement.Application.Courses.Models;

public sealed record CourseReadModel(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string? AcademicYear,
    string? Section,
    bool IsActive,
    int StudentCount,
    int SubjectTeacherCount,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
