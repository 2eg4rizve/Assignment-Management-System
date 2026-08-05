using AssignmentManagement.Api.Extensions;
using AssignmentManagement.Application.Common.Interfaces.Services;

namespace AssignmentManagement.Api.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor)
    : ICurrentUserService
{
    private System.Security.Claims.ClaimsPrincipal? User =>
        httpContextAccessor.HttpContext?.User;

    public Guid? UserId => User?.GetUserId();

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public bool IsInRole(string role) => User?.IsInRole(role) == true;
}
