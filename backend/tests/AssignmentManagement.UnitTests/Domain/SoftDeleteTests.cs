using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class SoftDeleteTests
{
    [Fact]
    public void SoftDelete_ShouldSetDeletionMetadata()
    {
        var course = new Course("CSE-101", "Computer Science", null, "2026", "A");
        var deletedAtUtc = DateTimeOffset.Parse("2026-08-05T12:00:00Z");

        course.SoftDelete(deletedAtUtc);

        Assert.True(course.IsDeleted);
        Assert.Equal(deletedAtUtc, course.DeletedAtUtc);
    }

    [Fact]
    public void Restore_ShouldClearDeletionMetadata()
    {
        var course = new Course("CSE-101", "Computer Science", null, "2026", "A");
        course.SoftDelete(DateTimeOffset.Parse("2026-08-05T12:00:00Z"));

        course.Restore();

        Assert.False(course.IsDeleted);
        Assert.Null(course.DeletedAtUtc);
    }
}
