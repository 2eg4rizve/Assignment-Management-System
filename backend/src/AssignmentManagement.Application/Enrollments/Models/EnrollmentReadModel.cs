namespace AssignmentManagement.Application.Enrollments.Models;

public sealed record EnrollmentReadModel
{
    public required Guid Id { get; init; }
    public required Guid StudentId { get; init; }
    public required string StudentFullName { get; init; }
    public required string StudentEmail { get; init; }
    public required Guid CourseId { get; init; }
    public required string CourseCode { get; init; }
    public required string CourseName { get; init; }
    public string? AcademicYear { get; init; }
    public string? Section { get; init; }
    public required DateTimeOffset EnrolledAtUtc { get; init; }
    public required bool IsActive { get; init; }
    public required DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset? UpdatedAtUtc { get; init; }
}
