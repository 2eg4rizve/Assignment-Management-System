using AssignmentManagement.Application.Dtos.RequestDtos.Subjects;
using AssignmentManagement.Application.Subjects.Models;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Common.Interfaces.Repositories;

public interface ISubjectRepository : IRepository<Subject>
{
    Task<bool> CodeExistsAsync(
        string normalizedCode,
        Guid? excludingSubjectId,
        CancellationToken cancellationToken = default);

    Task<SubjectReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyCollection<SubjectReadModel> Items, int TotalCount)> GetPagedAsync(
        SubjectQueryRequest request,
        CancellationToken cancellationToken = default);
}
