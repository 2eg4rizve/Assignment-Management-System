using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Domain.Exceptions;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class AssignmentTests
{
    [Fact]
    public void Constructor_ShouldCreateDraftWithNormalizedDetails()
    {
        var assignment = CreateAssignment();

        Assert.Equal(AssignmentStatus.Draft, assignment.Status);
        Assert.Equal("Weekly task", assignment.Title);
        Assert.Equal("Solve every problem", assignment.Description);
    }

    [Fact]
    public void Publish_ShouldSetPublishedStatusAndTimestamp()
    {
        var assignment = CreateAssignment();
        var publishedAtUtc = DateTimeOffset.Parse("2026-08-07T10:00:00Z");

        assignment.Publish(publishedAtUtc);

        Assert.Equal(AssignmentStatus.Published, assignment.Status);
        Assert.Equal(publishedAtUtc, assignment.PublishedAtUtc);
    }

    [Fact]
    public void Publish_WithExpiredDeadline_ShouldFail()
    {
        var assignment = CreateAssignment(DateTimeOffset.Parse("2026-08-07T09:00:00Z"));

        var exception = Assert.Throws<DomainException>(() =>
            assignment.Publish(DateTimeOffset.Parse("2026-08-07T10:00:00Z")));

        Assert.Equal("The deadline must be in the future when publishing.", exception.Message);
    }

    [Fact]
    public void Close_PublishedAssignment_ShouldSetClosedStatus()
    {
        var assignment = CreateAssignment();
        assignment.Publish(DateTimeOffset.Parse("2026-08-07T10:00:00Z"));

        assignment.Close();

        Assert.Equal(AssignmentStatus.Closed, assignment.Status);
    }

    [Fact]
    public void SoftDelete_PublishedAssignment_ShouldFail()
    {
        var assignment = CreateAssignment();
        assignment.Publish(DateTimeOffset.Parse("2026-08-07T10:00:00Z"));

        Assert.Throws<DomainException>(() =>
            assignment.SoftDelete(DateTimeOffset.Parse("2026-08-08T10:00:00Z")));
    }

    private static Assignment CreateAssignment(DateTimeOffset? deadlineUtc = null) =>
        new(
            Guid.NewGuid(),
            " Weekly task ",
            " Solve every problem ",
            deadlineUtc ?? DateTimeOffset.Parse("2026-08-10T10:00:00Z"),
            100,
            true);
}
