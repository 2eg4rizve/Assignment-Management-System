using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Assignments;

public sealed record CreateAssignmentRequest
{
    public Guid TeachingAssignmentId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTimeOffset DeadlineUtc { get; init; }

    public decimal MaximumMarks { get; init; }

    public bool AllowResubmission { get; init; }

    public bool PublishNow { get; init; }
}

public sealed record UpdateAssignmentRequest
{
    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTimeOffset DeadlineUtc { get; init; }

    public decimal MaximumMarks { get; init; }

    public bool AllowResubmission { get; init; }

    public string RowVersion { get; init; } = string.Empty;
}

public sealed record PublishAssignmentRequest
{
    public string RowVersion { get; init; } = string.Empty;
}

public sealed record CloseAssignmentRequest
{
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
