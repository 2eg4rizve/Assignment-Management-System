using AssignmentManagement.Domain.Common;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Domain.Exceptions;

namespace AssignmentManagement.Domain.Entities;

public sealed class Assignment : BaseEntity
{
    private Assignment()
    {
    }

    public Assignment(
        Guid teachingAssignmentId,
        string title,
        string description,
        DateTimeOffset deadlineUtc,
        decimal maximumMarks,
        bool allowResubmission)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(teachingAssignmentId, Guid.Empty);

        TeachingAssignmentId = teachingAssignmentId;
        UpdateDetails(title, description, deadlineUtc, maximumMarks, allowResubmission);
        Status = AssignmentStatus.Draft;
    }

    public Guid TeachingAssignmentId { get; private set; }

    public TeachingAssignment TeachingAssignment { get; private set; } = null!;

    public string Title { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public DateTimeOffset DeadlineUtc { get; private set; }

    public decimal MaximumMarks { get; private set; }

    public AssignmentStatus Status { get; private set; }

    public bool AllowResubmission { get; private set; }

    public DateTimeOffset? PublishedAtUtc { get; private set; }

    public uint Version { get; private set; }

    public void UpdateDetails(
        string title,
        string description,
        DateTimeOffset deadlineUtc,
        decimal maximumMarks,
        bool allowResubmission)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        if (maximumMarks <= 0)
        {
            throw new DomainException("Maximum marks must be greater than zero.");
        }

        if (Status == AssignmentStatus.Closed)
        {
            throw new DomainException("A closed assignment cannot be edited.");
        }

        Title = title.Trim();
        Description = description.Trim();
        DeadlineUtc = deadlineUtc;
        MaximumMarks = maximumMarks;
        AllowResubmission = allowResubmission;
    }

    public void Publish(DateTimeOffset utcNow)
    {
        if (Status != AssignmentStatus.Draft)
        {
            throw new DomainException("Only a draft assignment can be published.");
        }

        if (DeadlineUtc <= utcNow)
        {
            throw new DomainException("The deadline must be in the future when publishing.");
        }

        Status = AssignmentStatus.Published;
        PublishedAtUtc = utcNow;
    }

    public void Close()
    {
        if (Status != AssignmentStatus.Published)
        {
            throw new DomainException("Only a published assignment can be closed.");
        }

        Status = AssignmentStatus.Closed;
    }

    public override void SoftDelete(DateTimeOffset deletedAtUtc)
    {
        if (Status != AssignmentStatus.Draft)
        {
            throw new DomainException("Only a draft assignment can be deleted.");
        }

        base.SoftDelete(deletedAtUtc);
    }
}
