namespace AssignmentManagement.Application.TeachingAssignments.Models;

public sealed record TeachingAssignmentReadModel(
    Guid Id,
    Guid TeacherId,
    string TeacherFullName,
    string TeacherEmail,
    Guid CourseId,
    string CourseCode,
    string CourseName,
    string? AcademicYear,
    string? Section,
    Guid SubjectId,
    string SubjectCode,
    string SubjectName,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
