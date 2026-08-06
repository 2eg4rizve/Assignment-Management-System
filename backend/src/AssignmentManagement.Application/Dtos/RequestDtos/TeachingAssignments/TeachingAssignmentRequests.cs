using AssignmentManagement.Application.Common.Models;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;

public sealed record CreateTeachingAssignmentRequest
{
    [Required]
    public Guid TeacherId { get; init; }

    [Required]
    public Guid CourseId { get; init; }

    [Required]
    public Guid SubjectId { get; init; }
}

public sealed record UpdateTeachingAssignmentRequest
{
    [Required]
    public Guid TeacherId { get; init; }

    [Required]
    public Guid CourseId { get; init; }

    [Required]
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
