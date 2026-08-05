using AssignmentManagement.Domain.Common;

namespace AssignmentManagement.Domain.Entities;

public sealed class Subject : BaseEntity
{
    private Subject()
    {
    }

    public Subject(string code, string name, string? description)
    {
        Update(code, name, description);
        IsActive = true;
    }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public void Update(string code, string name, string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Code = code.Trim().ToUpperInvariant();
        Name = name.Trim();
        Description = description?.Trim();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
