using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Common;

public sealed record UserSummaryResponse(
    Guid Id,
    string FullName,
    string Email);

public sealed record CourseSummaryResponse(
    Guid Id,
    string Code,
    string Name,
    string? AcademicYear,
    string? Section);

public sealed record SubjectSummaryResponse(
    Guid Id,
    string Code,
    string Name);

public sealed record AssignmentSummaryResponse(
    Guid Id,
    string Title,
    DateTimeOffset DeadlineUtc,
    decimal MaximumMarks,
    AssignmentStatus Status,
    CourseSummaryResponse Course,
    SubjectSummaryResponse Subject);

public sealed record SubmissionSummaryResponse(
    Guid Id,
    SubmissionStatus Status,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset LastSubmittedAtUtc,
    decimal? MarksAwarded,
    string? Feedback);
