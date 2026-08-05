using AssignmentManagement.Application.Courses.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Courses;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface ICourseRepository : IRepository<Course>
{
    Task<bool> CodeExistsAsync(
        string normalizedCode,
        Guid? excludingCourseId,
        CancellationToken cancellationToken = default);

    Task<CourseReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<CourseReadModel> Items, int TotalCount)> GetPagedAsync(
        CourseQueryRequest request,
        CancellationToken cancellationToken = default);
}
