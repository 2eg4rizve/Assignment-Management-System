using AssignmentManagement.Domain.Common;

namespace AssignmentManagement.Domain.Entities;

public sealed class TeachingAssignment : BaseEntity
{
    private TeachingAssignment()
    {
    }

    public TeachingAssignment(Guid teacherId, Guid courseId, Guid subjectId)
    {
        SetAssignment(teacherId, courseId, subjectId);
        IsActive = true;
    }

    public Guid TeacherId { get; private set; }

    public Guid CourseId { get; private set; }

    public Course Course { get; private set; } = null!;

    public Guid SubjectId { get; private set; }

    public Subject Subject { get; private set; } = null!;

    public bool IsActive { get; private set; }

    public void SetAssignment(Guid teacherId, Guid courseId, Guid subjectId)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(teacherId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(courseId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(subjectId, Guid.Empty);

        TeacherId = teacherId;
        CourseId = courseId;
        SubjectId = subjectId;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
