using AssignmentManagement.Domain.Common;

namespace AssignmentManagement.Domain.Entities;

public sealed class CourseEnrollment : BaseEntity
{
    private CourseEnrollment()
    {
    }

    public CourseEnrollment(Guid studentId, Guid courseId, DateTimeOffset enrolledAtUtc)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(studentId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(courseId, Guid.Empty);

        StudentId = studentId;
        CourseId = courseId;
        EnrolledAtUtc = enrolledAtUtc;
        IsActive = true;
    }

    public Guid StudentId { get; private set; }

    public Guid CourseId { get; private set; }

    public Course Course { get; private set; } = null!;

    public DateTimeOffset EnrolledAtUtc { get; private set; }

    public bool IsActive { get; private set; }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
