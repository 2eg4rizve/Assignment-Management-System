using AssignmentManagement.Domain.Common;

namespace AssignmentManagement.Domain.Entities;

public sealed class Course : BaseEntity
{
    private Course()
    {
    }

    public Course(
        string code,
        string name,
        string? description,
        string? academicYear,
        string? section)
    {
        Update(code, name, description, academicYear, section);
        IsActive = true;
    }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public string? AcademicYear { get; private set; }

    public string? Section { get; private set; }

    public bool IsActive { get; private set; }

    public void Update(
        string code,
        string name,
        string? description,
        string? academicYear,
        string? section)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Code = code.Trim().ToUpperInvariant();
        Name = name.Trim();
        Description = description?.Trim();
        AcademicYear = academicYear?.Trim();
        Section = section?.Trim();
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
