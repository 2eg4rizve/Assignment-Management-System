using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.TeachingAssignments;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ITeachingAssignmentService
{
    Task<PagedResponse<TeachingAssignmentResponse>> GetPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResponse<TeachingAssignmentResponse>> GetCurrentTeacherPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<TeachingAssignmentResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<TeachingAssignmentResponse> CreateAsync(
        CreateTeachingAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task<TeachingAssignmentResponse> UpdateAsync(
        Guid id,
        UpdateTeachingAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
