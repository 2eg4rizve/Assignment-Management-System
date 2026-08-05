using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Courses;
using AssignmentManagement.Application.Dtos.ResponseDtos.Courses;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ICourseService
{
    Task<PagedResponse<CourseResponse>> GetPagedAsync(
        CourseQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<CourseResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<CourseResponse> CreateAsync(
        CreateCourseRequest request,
        CancellationToken cancellationToken = default);

    Task<CourseResponse> UpdateAsync(
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
