using AssignmentManagement.Domain.Common;

namespace AssignmentManagement.UnitTests.Architecture;

public sealed class LayerDependencyTests
{
    [Fact]
    public void Domain_ShouldNotReferenceOuterLayers()
    {
        var forbiddenAssemblies = new[]
        {
            "AssignmentManagement.Application",
            "AssignmentManagement.Infrastructure",
            "AssignmentManagement.Api"
        };

        var referencedAssemblies = typeof(BaseEntity).Assembly
            .GetReferencedAssemblies()
            .Select(assembly => assembly.Name)
            .ToHashSet(StringComparer.Ordinal);

        Assert.DoesNotContain(forbiddenAssemblies, referencedAssemblies.Contains);
    }
}
