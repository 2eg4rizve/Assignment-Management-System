namespace AssignmentManagement.Application.Subjects.Models;

public sealed record SubjectReadModel(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
