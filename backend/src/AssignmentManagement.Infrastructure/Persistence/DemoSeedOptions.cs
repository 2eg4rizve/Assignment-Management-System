namespace AssignmentManagement.Infrastructure.Persistence;

public sealed class DemoSeedOptions
{
    public const string SectionName = "DemoSeed";

    public bool Enabled { get; set; }

    public string Password { get; set; } = string.Empty;
}
