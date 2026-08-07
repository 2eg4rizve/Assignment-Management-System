using AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;
using AssignmentManagement.Application.Enrollments.Models;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface ICourseEnrollmentRepository : IRepository<CourseEnrollment>
{
    Task<bool> ExistsAsync(
        Guid studentId,
        Guid courseId,
        CancellationToken cancellationToken = default);

    Task<bool> StudentExistsAsync(Guid studentId, CancellationToken cancellationToken = default);

    Task<bool> ActiveCourseExistsAsync(Guid courseId, CancellationToken cancellationToken = default);

    Task<EnrollmentReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<EnrollmentReadModel> Items, int TotalCount)> GetPagedAsync(
        EnrollmentQueryRequest request,
        CancellationToken cancellationToken = default);
}
