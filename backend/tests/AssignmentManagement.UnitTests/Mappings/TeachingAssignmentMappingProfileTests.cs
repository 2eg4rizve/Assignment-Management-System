using AssignmentManagement.Application.Mappings;
using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace AssignmentManagement.UnitTests.Mappings;

public sealed class TeachingAssignmentMappingProfileTests
{
    [Fact]
    public void Configuration_ShouldBeValid()
    {
        var configuration = new MapperConfiguration(
            config => config.AddProfile<TeachingAssignmentMappingProfile>(),
            NullLoggerFactory.Instance);

        configuration.AssertConfigurationIsValid();
    }
}
