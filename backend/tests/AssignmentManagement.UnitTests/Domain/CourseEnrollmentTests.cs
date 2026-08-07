using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class CourseEnrollmentTests
{
    [Fact]
    public void Constructor_ShouldCreateActiveEnrollment()
    {
        var enrolledAtUtc = DateTimeOffset.UtcNow;

        var enrollment = new CourseEnrollment(Guid.NewGuid(), Guid.NewGuid(), enrolledAtUtc);

        Assert.True(enrollment.IsActive);
        Assert.Equal(enrolledAtUtc, enrollment.EnrolledAtUtc);
    }

    [Fact]
    public void Deactivate_ShouldMakeEnrollmentInactive()
    {
        var enrollment = new CourseEnrollment(Guid.NewGuid(), Guid.NewGuid(), DateTimeOffset.UtcNow);

        enrollment.Deactivate();

        Assert.False(enrollment.IsActive);
    }
}
