namespace AssignmentManagement.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    public DateTimeOffset CreatedAtUtc { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTimeOffset? UpdatedAtUtc { get; set; }

    public Guid? UpdatedBy { get; set; }

    public bool IsDeleted { get; private set; }

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public virtual void SoftDelete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        IsDeleted = true;
        DeletedAtUtc = deletedAtUtc;
    }

    public virtual void Restore()
    {
        IsDeleted = false;
        DeletedAtUtc = null;
    }
}
