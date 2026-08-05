namespace AssignmentManagement.Application.Dtos.ResponseDtos.Subjects;

public sealed record SubjectResponse(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
