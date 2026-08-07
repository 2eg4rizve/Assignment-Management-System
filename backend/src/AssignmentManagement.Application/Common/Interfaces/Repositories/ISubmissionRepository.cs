using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Submissions.Models;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface ISubmissionRepository : IRepository<Submission>
{
    Task<(IReadOnlyCollection<SubmissionListReadModel> Items, int TotalCount)> GetPagedAsync(
        SubmissionQueryRequest request, Guid userId, bool isAdmin, bool isTeacher,
        CancellationToken cancellationToken = default);
    Task<SubmissionDetailReadModel?> GetDetailAsync(
        Guid id, Guid userId, bool isAdmin, bool isTeacher,
        CancellationToken cancellationToken = default);
    Task<bool> CanStudentSubmitAsync(Guid assignmentId, Guid studentId, DateTimeOffset utcNow,
        CancellationToken cancellationToken = default);
    Task<bool> CanStudentResubmitAsync(Guid assignmentId, Guid studentId, DateTimeOffset utcNow,
        CancellationToken cancellationToken = default);
    Task<bool> IsOwnedByStudentAsync(Guid id, Guid studentId,
        CancellationToken cancellationToken = default);
    Task<bool> IsOwnedByTeacherAsync(Guid id, Guid teacherId,
        CancellationToken cancellationToken = default);
    Task<Submission?> GetByAssignmentAndStudentAsync(Guid assignmentId, Guid studentId,
        CancellationToken cancellationToken = default);
    void SetOriginalVersion(Submission submission, uint version);
}
