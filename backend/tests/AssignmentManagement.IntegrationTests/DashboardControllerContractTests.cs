using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.IntegrationTests;

public sealed class DashboardControllerContractTests
{
    [Theory]
    [InlineData(nameof(DashboardController.GetAdmin), AuthorizationPolicies.RequireAdmin)]
    [InlineData(nameof(DashboardController.GetTeacher), AuthorizationPolicies.RequireTeacher)]
    [InlineData(nameof(DashboardController.GetStudent), AuthorizationPolicies.RequireStudent)]
    public void DashboardAction_ShouldRequireExpectedPolicy(string actionName, string policy)
    {
        var method = typeof(DashboardController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>());

        Assert.Equal(policy, attribute.Policy);
    }
}
