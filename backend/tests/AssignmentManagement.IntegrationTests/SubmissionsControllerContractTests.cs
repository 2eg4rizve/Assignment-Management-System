using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

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
    [InlineData(nameof(SubmissionsController.UpdateStatus), AuthorizationPolicies.RequireTeacher)]
    [InlineData(nameof(SubmissionsController.Grade), AuthorizationPolicies.RequireTeacher)]
    public void Mutation_ShouldRequireExpectedPolicy(string actionName, string policy)
    {
        var method = typeof(SubmissionsController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>());

        Assert.Equal(policy, attribute.Policy);
    }

    [Theory]
    [InlineData(nameof(SubmissionsController.GetForAssignment),
        "/api/v1/assignments/{assignmentId:guid}/submissions")]
    [InlineData(nameof(SubmissionsController.UpdateStatus), "{id:guid}/review-status")]
    [InlineData(nameof(SubmissionsController.Grade), "{id:guid}/grade")]
    public void Action_ShouldExposeExpectedRoute(string actionName, string template)
    {
        var method = typeof(SubmissionsController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(HttpMethodAttribute), true)
            .Cast<HttpMethodAttribute>());

        Assert.Equal(template, attribute.Template);
    }

    [Theory]
    [InlineData(nameof(SubmissionsController.UpdateStatus))]
    [InlineData(nameof(SubmissionsController.Grade))]
    public void Mutation_ShouldUsePut(string actionName)
    {
        var method = typeof(SubmissionsController).GetMethod(actionName)!;
        Assert.Single(method.GetCustomAttributes(typeof(HttpPutAttribute), true));
    }
}
