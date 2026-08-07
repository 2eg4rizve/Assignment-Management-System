using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.RequestDtos.Auth;
using AssignmentManagement.Application.Dtos.ResponseDtos.Auth;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Identity;
using AssignmentManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentManagement.Infrastructure.Authentication;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext,
    IUnitOfWork unitOfWork,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService,
    IOptions<JwtSettings> settings) : IAuthService
{
    private readonly JwtSettings _settings = settings.Value;

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || !user.IsActive || await userManager.IsLockedOutAsync(user))
            throw new AuthenticationFailedException();

        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            await userManager.AccessFailedAsync(user);
            throw new AuthenticationFailedException();
        }

        await userManager.ResetAccessFailedCountAsync(user);
        return await IssueTokensAsync(user, null, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = dateTimeProvider.UtcNow;
        var tokenHash = HashToken(request.RefreshToken);
        var existingToken = await dbContext.RefreshTokens.SingleOrDefaultAsync(
            token => token.TokenHash == tokenHash, cancellationToken);
        if (existingToken is null || !existingToken.IsActive(now))
            throw new AuthenticationFailedException("The refresh token is invalid or expired.");

        var user = await userManager.FindByIdAsync(existingToken.UserId.ToString());
        if (user is null || !user.IsActive || await userManager.IsLockedOutAsync(user))
            throw new AuthenticationFailedException("The refresh token is invalid or expired.");

        return await IssueTokensAsync(user, existingToken, cancellationToken);
    }

    public async Task LogoutAsync(
        LogoutRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.UserId
            ?? throw new AuthenticationFailedException("An authenticated user is required.");
        var tokenHash = HashToken(request.RefreshToken);
        var token = await dbContext.RefreshTokens.SingleOrDefaultAsync(
            value => value.TokenHash == tokenHash && value.UserId == userId,
            cancellationToken);
        if (token is null || !token.IsActive(dateTimeProvider.UtcNow))
            return;

        token.Revoke(dateTimeProvider.UtcNow);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<CurrentUserResponse> GetCurrentUserAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.UserId
            ?? throw new AuthenticationFailedException("An authenticated user is required.");
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new AuthenticationFailedException("The authenticated user no longer exists.");
        return await BuildUserResponseAsync(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(
        ApplicationUser user,
        RefreshToken? tokenToReplace,
        CancellationToken cancellationToken)
    {
        ValidateSettings();
        var now = dateTimeProvider.UtcNow;
        var roles = await userManager.GetRolesAsync(user);
        var expiresAtUtc = now.AddMinutes(_settings.AccessTokenMinutes);
        var accessToken = CreateAccessToken(user, roles, now, expiresAtUtc);
        var rawRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshToken = new RefreshToken(
            user.Id,
            HashToken(rawRefreshToken),
            now,
            now.AddDays(_settings.RefreshTokenDays));

        if (tokenToReplace is not null)
            tokenToReplace.Revoke(now, refreshToken.Id);
        await dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken,
            expiresAtUtc,
            rawRefreshToken,
            BuildUserResponse(user, roles));
    }

    private string CreateAccessToken(
        ApplicationUser user,
        IEnumerable<string> roles,
        DateTimeOffset issuedAtUtc,
        DateTimeOffset expiresAtUtc)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
        var token = new JwtSecurityToken(
            _settings.Issuer,
            _settings.Audience,
            claims,
            issuedAtUtc.UtcDateTime,
            expiresAtUtc.UtcDateTime,
            new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<CurrentUserResponse> BuildUserResponseAsync(ApplicationUser user) =>
        BuildUserResponse(user, await userManager.GetRolesAsync(user));

    private static CurrentUserResponse BuildUserResponse(
        ApplicationUser user,
        IEnumerable<string> roles) =>
        new(
            user.Id,
            user.FirstName,
            user.LastName,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email ?? string.Empty,
            roles.Select(role => Enum.Parse<UserRole>(role)).ToArray());

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private void ValidateSettings()
    {
        if (string.IsNullOrWhiteSpace(_settings.Issuer) ||
            string.IsNullOrWhiteSpace(_settings.Audience) ||
            Encoding.UTF8.GetByteCount(_settings.Secret) < 32 ||
            _settings.AccessTokenMinutes <= 0 ||
            _settings.RefreshTokenDays <= 0)
        {
            throw new InvalidOperationException("JWT configuration is invalid.");
        }
    }
}
