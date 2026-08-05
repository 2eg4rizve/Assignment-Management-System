using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Submissions;

public sealed record CreateSubmissionRequest
{
    public string AnswerText { get; init; } = string.Empty;
}

public sealed record UpdateSubmissionRequest
{
    public string AnswerText { get; init; } = string.Empty;

    public string RowVersion { get; init; } = string.Empty;
}

public sealed record UpdateSubmissionStatusRequest
{
    public SubmissionStatus Status { get; init; }

    public string RowVersion { get; init; } = string.Empty;
}

public sealed record GradeSubmissionRequest
{
    public decimal MarksAwarded { get; init; }

    public string? Feedback { get; init; }

    public bool PublishGrade { get; init; } = true;

    public string RowVersion { get; init; } = string.Empty;
}

public sealed record SubmissionQueryRequest : PaginationRequest
{
    public Guid? AssignmentId { get; init; }

    public Guid? StudentId { get; init; }

    public SubmissionStatus? Status { get; init; }

    public DateTimeOffset? SubmittedFromUtc { get; init; }

    public DateTimeOffset? SubmittedToUtc { get; init; }

    public SortDirection SortDirection { get; init; } = SortDirection.Desc;
}
