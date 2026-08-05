using AssignmentManagement.Application.Common.Interfaces.Services;

namespace AssignmentManagement.Infrastructure.Services;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
