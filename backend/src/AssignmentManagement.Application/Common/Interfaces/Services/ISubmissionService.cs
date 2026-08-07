using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ISubmissionService
{
    Task<PagedResponse<SubmissionListItemResponse>> GetPagedAsync(SubmissionQueryRequest request,
        CancellationToken cancellationToken = default);
    Task<SubmissionDetailResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubmissionDetailResponse> CreateAsync(Guid assignmentId, CreateSubmissionRequest request,
        CancellationToken cancellationToken = default);
    Task<SubmissionMutationResponse> UpdateAsync(Guid id, UpdateSubmissionRequest request,
        CancellationToken cancellationToken = default);
    Task<SubmissionMutationResponse> UpdateStatusAsync(Guid id, UpdateSubmissionStatusRequest request,
        CancellationToken cancellationToken = default);
    Task<SubmissionMutationResponse> GradeAsync(Guid id, GradeSubmissionRequest request,
        CancellationToken cancellationToken = default);
}
