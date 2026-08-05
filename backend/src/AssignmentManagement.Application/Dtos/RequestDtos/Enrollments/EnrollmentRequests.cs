using AssignmentManagement.Application.Common.Models;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;

public sealed record CreateEnrollmentRequest
{
    public Guid StudentId { get; init; }

    public Guid CourseId { get; init; }
}

public sealed record EnrollmentQueryRequest : PaginationRequest
{
    public Guid? StudentId { get; init; }

    public Guid? CourseId { get; init; }

    public bool? IsActive { get; init; }
}
