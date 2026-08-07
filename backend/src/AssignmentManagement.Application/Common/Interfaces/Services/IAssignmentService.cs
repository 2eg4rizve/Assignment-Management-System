using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface IAssignmentService
{
    Task<PagedResponse<AssignmentListItemResponse>> GetPagedAsync(
        AssignmentQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<AssignmentDetailResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<AssignmentDetailResponse> CreateAsync(
        CreateAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task<AssignmentMutationResponse> UpdateAsync(
        Guid id,
        UpdateAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task<AssignmentMutationResponse> PublishAsync(
        Guid id,
        PublishAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task<AssignmentMutationResponse> CloseAsync(
        Guid id,
        CloseAssignmentRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, string rowVersion, CancellationToken cancellationToken = default);
}
