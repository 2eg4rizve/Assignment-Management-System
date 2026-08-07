using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Application.Common.Constants;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Submissions;

public sealed record CreateSubmissionRequest
{
    [Required, StringLength(ValidationConstants.SubmissionAnswerMaxLength)]
    public string AnswerText { get; init; } = string.Empty;
}

public sealed record UpdateSubmissionRequest
{
    [Required, StringLength(ValidationConstants.SubmissionAnswerMaxLength)]
    public string AnswerText { get; init; } = string.Empty;

    [Required]
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record UpdateSubmissionStatusRequest
{
    [EnumDataType(typeof(SubmissionStatus))]
    public SubmissionStatus Status { get; init; }

    [Required]
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record GradeSubmissionRequest
{
    [Range(typeof(decimal), "0", "99999.99")]
    public decimal MarksAwarded { get; init; }

    [StringLength(ValidationConstants.FeedbackMaxLength)]
    public string? Feedback { get; init; }

    public bool PublishGrade { get; init; } = true;

    [Required]
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
