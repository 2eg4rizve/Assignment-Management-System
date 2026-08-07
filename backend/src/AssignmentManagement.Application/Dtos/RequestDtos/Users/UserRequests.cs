using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Application.Common.Constants;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Users;

public sealed record CreateUserRequest
{
    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string LastName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }
}

public sealed record UpdateUserRequest
{
    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string LastName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    public bool IsActive { get; init; }
}

public sealed record AdminResetPasswordRequest
{
    [Required, MinLength(8)]
    public string NewPassword { get; init; } = string.Empty;
}

public sealed record UserQueryRequest : PaginationRequest
{
    public UserRole? Role { get; init; }

    public bool? IsActive { get; init; }
}
