using AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface IDashboardService
{
    Task<AdminDashboardResponse> GetAdminAsync(CancellationToken cancellationToken = default);
    Task<TeacherDashboardResponse> GetTeacherAsync(CancellationToken cancellationToken = default);
    Task<StudentDashboardResponse> GetStudentAsync(CancellationToken cancellationToken = default);
}
