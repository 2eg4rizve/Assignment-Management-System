using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Users;

public sealed record CreateUserRequest
{
    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;

    public UserRole Role { get; init; }
}

public sealed record UpdateUserRequest
{
    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public UserRole Role { get; init; }

    public bool IsActive { get; init; }
}

public sealed record AdminResetPasswordRequest
{
    public string NewPassword { get; init; } = string.Empty;
}

public sealed record UserQueryRequest : PaginationRequest
{
    public UserRole? Role { get; init; }

    public bool? IsActive { get; init; }
}
