using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Constants;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Assignments;

public sealed record CreateAssignmentRequest
{
    [Required]
    public Guid TeachingAssignmentId { get; init; }

    [Required, StringLength(ValidationConstants.AssignmentTitleMaxLength)]
    public string Title { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.AssignmentDescriptionMaxLength)]
    public string Description { get; init; } = string.Empty;

    public DateTimeOffset DeadlineUtc { get; init; }

    [Range(typeof(decimal), "0.01", "99999.99")]
    public decimal MaximumMarks { get; init; }

    public bool AllowResubmission { get; init; }

    public bool PublishNow { get; init; }
}

public sealed record UpdateAssignmentRequest
{
    [Required, StringLength(ValidationConstants.AssignmentTitleMaxLength)]
    public string Title { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.AssignmentDescriptionMaxLength)]
    public string Description { get; init; } = string.Empty;

    public DateTimeOffset DeadlineUtc { get; init; }

    [Range(typeof(decimal), "0.01", "99999.99")]
    public decimal MaximumMarks { get; init; }

    public bool AllowResubmission { get; init; }

    [Required]
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record PublishAssignmentRequest
{
    [Required]
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record CloseAssignmentRequest
{
    [Required]
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record AssignmentQueryRequest : PaginationRequest
{
    public AssignmentStatus? Status { get; init; }

    public Guid? CourseId { get; init; }

    public Guid? SubjectId { get; init; }

    public Guid? TeacherId { get; init; }

    public DateTimeOffset? DeadlineFromUtc { get; init; }

    public DateTimeOffset? DeadlineToUtc { get; init; }

    public AssignmentSortField SortBy { get; init; } = AssignmentSortField.CreatedAt;

    public SortDirection SortDirection { get; init; } = SortDirection.Desc;
}
