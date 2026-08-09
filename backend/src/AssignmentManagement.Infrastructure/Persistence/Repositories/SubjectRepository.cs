using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.RequestDtos.Subjects;
using AssignmentManagement.Application.Subjects.Models;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class SubjectRepository : Repository<Subject>, ISubjectRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SubjectRepository(
        ApplicationDbContext dbContext,
        IDateTimeProvider dateTimeProvider)
        : base(dbContext, dateTimeProvider)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CodeExistsAsync(
        string normalizedCode,
        Guid? excludingSubjectId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subjects.AnyAsync(
            subject => subject.Code == normalizedCode &&
                       (!excludingSubjectId.HasValue || subject.Id != excludingSubjectId.Value),
            cancellationToken);
    }

    public async Task<SubjectReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Subjects
            .AsNoTracking()
            .Where(subject => subject.Id == id);

        return await Project(query)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<(IReadOnlyCollection<SubjectReadModel> Items, int TotalCount)> GetPagedAsync(
        SubjectQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Subject> query = _dbContext.Subjects.AsNoTracking();

        if (request.IsActive.HasValue)
        {
            query = query.Where(subject => subject.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchPattern = $"%{request.Search.Trim()}%";
            query = query.Where(subject =>
                EF.Functions.ILike(subject.Code, searchPattern) ||
                EF.Functions.ILike(subject.Name, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var pageQuery = query
            .OrderBy(subject => subject.Name)
            .ThenBy(subject => subject.Code)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        var items = await Project(pageQuery)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private static IQueryable<SubjectReadModel> Project(IQueryable<Subject> query)
    {
        return query.Select(subject => new SubjectReadModel(
            subject.Id,
            subject.Code,
            subject.Name,
            subject.Description,
            subject.IsActive,
            subject.CreatedAtUtc,
            subject.UpdatedAtUtc));
    }
}
