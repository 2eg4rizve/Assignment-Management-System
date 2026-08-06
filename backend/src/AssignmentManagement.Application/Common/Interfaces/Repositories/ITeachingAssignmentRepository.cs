using AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;
using AssignmentManagement.Application.TeachingAssignments.Models;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface ITeachingAssignmentRepository : IRepository<TeachingAssignment>
{
    Task<bool> ExistsAsync(
        Guid teacherId,
        Guid courseId,
        Guid subjectId,
        Guid? excludingId,
        CancellationToken cancellationToken = default);

    Task<bool> TeacherExistsAsync(Guid teacherId, CancellationToken cancellationToken = default);

    Task<bool> ActiveCourseExistsAsync(Guid courseId, CancellationToken cancellationToken = default);

    Task<bool> ActiveSubjectExistsAsync(Guid subjectId, CancellationToken cancellationToken = default);

    Task<TeachingAssignmentReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<TeachingAssignmentReadModel> Items, int TotalCount)> GetPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default);
}
