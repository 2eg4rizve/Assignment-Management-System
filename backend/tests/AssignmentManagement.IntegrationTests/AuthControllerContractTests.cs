using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.IntegrationTests;

public sealed class AuthControllerContractTests
{
    [Theory]
    [InlineData(nameof(AuthController.Login))]
    [InlineData(nameof(AuthController.Refresh))]
    public void AnonymousEndpoints_ShouldAllowAnonymousAccess(string actionName)
    {
        var action = typeof(AuthController).GetMethod(actionName);

        Assert.NotNull(action);
        Assert.NotEmpty(action.GetCustomAttributes(typeof(AllowAnonymousAttribute), true));
    }

    [Theory]
    [InlineData(nameof(AuthController.Logout))]
    [InlineData(nameof(AuthController.Me))]
    public void UserEndpoints_ShouldRequireAuthorization(string actionName)
    {
        var action = typeof(AuthController).GetMethod(actionName);

        Assert.NotNull(action);
        Assert.NotEmpty(action.GetCustomAttributes(typeof(AuthorizeAttribute), true));
    }
}
