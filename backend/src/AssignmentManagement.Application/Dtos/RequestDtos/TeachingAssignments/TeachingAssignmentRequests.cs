using AssignmentManagement.Application.Common.Models;

namespace AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;

public sealed record CreateTeachingAssignmentRequest
{
    public Guid TeacherId { get; init; }

    public Guid CourseId { get; init; }

    public Guid SubjectId { get; init; }
}

public sealed record UpdateTeachingAssignmentRequest
{
    public Guid TeacherId { get; init; }

    public Guid CourseId { get; init; }

    public Guid SubjectId { get; init; }

    public bool IsActive { get; init; }
}

public sealed record TeachingAssignmentQueryRequest : PaginationRequest
{
    public Guid? TeacherId { get; init; }

    public Guid? CourseId { get; init; }

    public Guid? SubjectId { get; init; }

    public bool? IsActive { get; init; }
}
