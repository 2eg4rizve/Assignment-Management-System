using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class CourseTests
{
    [Fact]
    public void Constructor_ShouldNormalizeCode()
    {
        var course = new Course(" cse-101 ", "Computer Science", null, "2026", "A");

        Assert.Equal("CSE-101", course.Code);
    }
}
