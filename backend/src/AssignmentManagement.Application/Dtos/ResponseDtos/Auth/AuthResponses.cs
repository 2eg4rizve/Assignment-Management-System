using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Auth;

public sealed record CurrentUserResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    IReadOnlyCollection<UserRole> Roles);

public sealed record AuthResponse(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    string RefreshToken,
    CurrentUserResponse User);
