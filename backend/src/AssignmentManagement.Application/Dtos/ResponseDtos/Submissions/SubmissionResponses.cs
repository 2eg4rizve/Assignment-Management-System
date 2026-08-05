using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;

public sealed record SubmissionListItemResponse(
    Guid Id,
    Guid AssignmentId,
    string AssignmentTitle,
    Guid StudentId,
    string StudentName,
    string StudentEmail,
    SubmissionStatus Status,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset LastSubmittedAtUtc,
    decimal? MarksAwarded,
    decimal MaximumMarks,
    bool IsLate);

public sealed record SubmissionDetailResponse(
    Guid Id,
    AssignmentSummaryResponse Assignment,
    UserSummaryResponse Student,
    string AnswerText,
    SubmissionStatus Status,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset LastSubmittedAtUtc,
    decimal? MarksAwarded,
    decimal MaximumMarks,
    string? Feedback,
    DateTimeOffset? GradedAtUtc,
    string? GradedByName,
    string RowVersion);

public sealed record SubmissionMutationResponse(
    Guid Id,
    SubmissionStatus Status,
    DateTimeOffset LastSubmittedAtUtc,
    decimal? MarksAwarded,
    DateTimeOffset? GradedAtUtc,
    string RowVersion);
