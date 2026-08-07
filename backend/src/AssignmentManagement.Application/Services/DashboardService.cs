using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;

namespace AssignmentManagement.Application.Services;

public sealed class DashboardService(IDashboardRepository repository,
    ICurrentUserService currentUserService, IDateTimeProvider dateTimeProvider) : IDashboardService
{
    public Task<AdminDashboardResponse> GetAdminAsync(CancellationToken cancellationToken = default)
    {
        RequireRole("Admin");
        return repository.GetAdminAsync(cancellationToken);
    }

    public Task<TeacherDashboardResponse> GetTeacherAsync(CancellationToken cancellationToken = default) =>
        repository.GetTeacherAsync(RequireRole("Teacher"), cancellationToken);

    public Task<StudentDashboardResponse> GetStudentAsync(CancellationToken cancellationToken = default) =>
        repository.GetStudentAsync(RequireRole("Student"), dateTimeProvider.UtcNow, cancellationToken);

    private Guid RequireRole(string role)
    {
        var userId = currentUserService.UserId
            ?? throw new ForbiddenAccessException("An authenticated user is required.");
        if (!currentUserService.IsInRole(role))
            throw new ForbiddenAccessException($"A {role.ToLowerInvariant()} account is required.");
        return userId;
    }
}
