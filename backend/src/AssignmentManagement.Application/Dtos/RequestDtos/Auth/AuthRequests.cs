using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Constants;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Auth;

public sealed record LoginRequest
{
    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public sealed record RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}

public sealed record LogoutRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}
