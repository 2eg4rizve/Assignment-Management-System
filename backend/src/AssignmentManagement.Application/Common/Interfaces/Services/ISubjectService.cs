using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Subjects;
using AssignmentManagement.Application.Dtos.ResponseDtos.Subjects;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ISubjectService
{
    Task<PagedResponse<SubjectResponse>> GetPagedAsync(
        SubjectQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<SubjectResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<SubjectResponse> CreateAsync(
        CreateSubjectRequest request,
        CancellationToken cancellationToken = default);

    Task<SubjectResponse> UpdateAsync(
        Guid id,
        UpdateSubjectRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
