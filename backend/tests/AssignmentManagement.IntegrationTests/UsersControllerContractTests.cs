using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.IntegrationTests;

public sealed class UsersControllerContractTests
{
    [Fact]
    public void Controller_ShouldRequireAdminPolicy()
    {
        var attribute = Assert.Single(
            typeof(UsersController).GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .Cast<AuthorizeAttribute>());

        Assert.Equal(AuthorizationPolicies.RequireAdmin, attribute.Policy);
    }

    [Fact]
    public void Controller_ShouldExposeAllManagementActions()
    {
        var actionNames = typeof(UsersController).GetMethods()
            .Select(method => method.Name)
            .ToHashSet(StringComparer.Ordinal);

        Assert.Contains(nameof(UsersController.GetAll), actionNames);
        Assert.Contains(nameof(UsersController.GetById), actionNames);
        Assert.Contains(nameof(UsersController.Create), actionNames);
        Assert.Contains(nameof(UsersController.Update), actionNames);
        Assert.Contains(nameof(UsersController.ResetPassword), actionNames);
    }
}
