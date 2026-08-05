using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class SubjectTests
{
    [Fact]
    public void Constructor_ShouldNormalizeCode()
    {
        var subject = new Subject(" math-101 ", "Mathematics", null);

        Assert.Equal("MATH-101", subject.Code);
    }
}
