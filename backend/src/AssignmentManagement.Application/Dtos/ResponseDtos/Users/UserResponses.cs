using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Users;

public sealed record UserListItemResponse(
    Guid Id,
    string FullName,
    string Email,
    string? StudentCode,
    string? TeacherCode,
    IReadOnlyCollection<UserRole> Roles,
    bool IsActive,
    DateTimeOffset CreatedAtUtc);

public sealed record UserDetailResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? StudentCode,
    string? TeacherCode,
    IReadOnlyCollection<UserRole> Roles,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
