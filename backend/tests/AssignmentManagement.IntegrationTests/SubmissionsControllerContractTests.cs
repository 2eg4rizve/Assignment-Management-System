using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.IntegrationTests;

public sealed class SubmissionsControllerContractTests
{
    [Fact]
    public void Controller_ShouldRequireAuthentication()
    {
        var attribute = Assert.Single(
            typeof(SubmissionsController).GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .Cast<AuthorizeAttribute>());

        Assert.Null(attribute.Policy);
    }

    [Theory]
    [InlineData(nameof(SubmissionsController.Create), AuthorizationPolicies.RequireStudent)]
    [InlineData(nameof(SubmissionsController.Update), AuthorizationPolicies.RequireStudent)]
    [InlineData(nameof(SubmissionsController.UpdateStatus), AuthorizationPolicies.RequireTeacher)]
    [InlineData(nameof(SubmissionsController.Grade), AuthorizationPolicies.RequireTeacher)]
    public void Mutation_ShouldRequireExpectedPolicy(string actionName, string policy)
    {
        var method = typeof(SubmissionsController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>());

        Assert.Equal(policy, attribute.Policy);
    }
}
