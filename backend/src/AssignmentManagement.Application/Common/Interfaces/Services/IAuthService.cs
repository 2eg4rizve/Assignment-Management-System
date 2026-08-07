using AssignmentManagement.Application.Dtos.RequestDtos.Auth;
using AssignmentManagement.Application.Dtos.ResponseDtos.Auth;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<AuthResponse> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default);

    Task<CurrentUserResponse> GetCurrentUserAsync(CancellationToken cancellationToken = default);
}
