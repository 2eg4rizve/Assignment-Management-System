using System.Security.Claims;
using AssignmentManagement.Api.Extensions;

namespace AssignmentManagement.IntegrationTests;

public sealed class ClaimsPrincipalExtensionsTests
{
    [Theory]
    [InlineData(ClaimTypes.NameIdentifier)]
    [InlineData("sub")]
    public void GetUserId_ShouldSupportIdentityAndJwtSubjectClaims(string claimType)
    {
        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(
            new ClaimsIdentity([new Claim(claimType, userId.ToString())]));

        Assert.Equal(userId, principal.GetUserId());
    }
}
