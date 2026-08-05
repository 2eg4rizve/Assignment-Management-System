namespace AssignmentManagement.Application.Dtos.RequestDtos.Auth;

public sealed record LoginRequest
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}

public sealed record RefreshTokenRequest
{
    public string RefreshToken { get; init; } = string.Empty;
}

public sealed record LogoutRequest
{
    public string RefreshToken { get; init; } = string.Empty;
}
