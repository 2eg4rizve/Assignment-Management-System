namespace AssignmentManagement.Application.Dtos.ResponseDtos.Courses;

public sealed record CourseResponse(
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
