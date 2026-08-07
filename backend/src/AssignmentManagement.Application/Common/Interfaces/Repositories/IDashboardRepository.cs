using AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface IDashboardRepository
{
    Task<AdminDashboardResponse> GetAdminAsync(CancellationToken cancellationToken = default);
    Task<TeacherDashboardResponse> GetTeacherAsync(Guid teacherId,
        CancellationToken cancellationToken = default);
    Task<StudentDashboardResponse> GetStudentAsync(Guid studentId, DateTimeOffset utcNow,
        CancellationToken cancellationToken = default);
}
