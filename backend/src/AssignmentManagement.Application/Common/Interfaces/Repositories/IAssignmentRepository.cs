using AssignmentManagement.Application.Assignments.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Assignments;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface IAssignmentRepository : IRepository<DomainAssignment>
{
    Task<bool> ActiveTeachingAssignmentBelongsToTeacherAsync(
        Guid teachingAssignmentId,
        Guid teacherId,
        CancellationToken cancellationToken = default);

    Task<bool> IsOwnedByTeacherAsync(
        Guid assignmentId,
        Guid teacherId,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<AssignmentListReadModel> Items, int TotalCount)> GetPagedAsync(
        AssignmentQueryRequest request,
        Guid userId,
        bool isAdmin,
        bool isTeacher,
        CancellationToken cancellationToken = default);

    Task<AssignmentDetailReadModel?> GetDetailAsync(
        Guid id,
        Guid userId,
        bool isAdmin,
        bool isTeacher,
        CancellationToken cancellationToken = default);

    void SetOriginalVersion(DomainAssignment assignment, uint version);
}
