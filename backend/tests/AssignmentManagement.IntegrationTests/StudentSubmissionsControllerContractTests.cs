using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.IntegrationTests;

public sealed class StudentSubmissionsControllerContractTests
{
    [Fact]
    public void Controller_ShouldRequireStudentPolicy()
    {
        var attribute = Assert.Single(
            typeof(StudentSubmissionsController).GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .Cast<AuthorizeAttribute>());

        Assert.Equal(AuthorizationPolicies.RequireStudent, attribute.Policy);
    }

    [Fact]
    public void Controller_ShouldExposeStudentSubmissionWorkflow()
    {
        var actions = typeof(StudentSubmissionsController).GetMethods()
            .Select(method => method.Name).ToHashSet(StringComparer.Ordinal);

        Assert.Contains(nameof(StudentSubmissionsController.GetMine), actions);
        Assert.Contains(nameof(StudentSubmissionsController.GetForAssignment), actions);
        Assert.Contains(nameof(StudentSubmissionsController.Create), actions);
        Assert.Contains(nameof(StudentSubmissionsController.Update), actions);
    }
}
