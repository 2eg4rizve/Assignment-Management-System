namespace AssignmentManagement.Application.TeachingAssignments.Models;

public sealed record TeachingAssignmentReadModel
{
    public required Guid Id { get; init; }
    public required Guid TeacherId { get; init; }
    public required string TeacherFullName { get; init; }
    public required string TeacherEmail { get; init; }
    public string? TeacherCode { get; init; }
    public required Guid CourseId { get; init; }
    public required string CourseCode { get; init; }
    public required string CourseName { get; init; }
    public string? AcademicYear { get; init; }
    public string? Section { get; init; }
    public required Guid SubjectId { get; init; }
    public required string SubjectCode { get; init; }
    public required string SubjectName { get; init; }
    public required bool IsActive { get; init; }
    public required DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset? UpdatedAtUtc { get; init; }
}
