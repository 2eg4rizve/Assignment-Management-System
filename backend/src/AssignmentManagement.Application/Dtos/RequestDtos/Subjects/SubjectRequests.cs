using AssignmentManagement.Application.Common.Models;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Subjects;

public sealed record CreateSubjectRequest
{
    public string Code { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }
}

public sealed record UpdateSubjectRequest
{
    public string Code { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsActive { get; init; }
}

public sealed record SubjectQueryRequest : PaginationRequest
{
    public bool? IsActive { get; init; }
}
