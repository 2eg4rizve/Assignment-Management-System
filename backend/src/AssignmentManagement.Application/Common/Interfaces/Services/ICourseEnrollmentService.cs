using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Enrollments;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ICourseEnrollmentService
{
    Task<PagedResponse<EnrollmentResponse>> GetPagedAsync(
        EnrollmentQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<EnrollmentResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<EnrollmentResponse> CreateAsync(
        CreateEnrollmentRequest request,
        CancellationToken cancellationToken = default);

    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
