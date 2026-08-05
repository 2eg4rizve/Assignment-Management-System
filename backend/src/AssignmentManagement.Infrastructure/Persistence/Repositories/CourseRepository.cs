using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Courses.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Courses;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class CourseRepository : Repository<Course>, ICourseRepository
{
    private readonly ApplicationDbContext _dbContext;

    public CourseRepository(
        ApplicationDbContext dbContext,
        IDateTimeProvider dateTimeProvider)
        : base(dbContext, dateTimeProvider)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CodeExistsAsync(
        string normalizedCode,
        Guid? excludingCourseId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Courses.AnyAsync(
            course => course.Code == normalizedCode &&
                      (!excludingCourseId.HasValue || course.Id != excludingCourseId.Value),
            cancellationToken);
    }

    public async Task<CourseReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await Project(_dbContext.Courses.AsNoTracking())
            .SingleOrDefaultAsync(course => course.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyCollection<CourseReadModel> Items, int TotalCount)> GetPagedAsync(
        CourseQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Course> query = _dbContext.Courses.AsNoTracking();

        if (request.IsActive.HasValue)
        {
            query = query.Where(course => course.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.AcademicYear))
        {
            var academicYear = request.AcademicYear.Trim();
            query = query.Where(course => course.AcademicYear == academicYear);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchPattern = $"%{request.Search.Trim()}%";
            query = query.Where(course =>
                EF.Functions.ILike(course.Code, searchPattern) ||
                EF.Functions.ILike(course.Name, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await Project(query)
            .OrderBy(course => course.Name)
            .ThenBy(course => course.Code)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private IQueryable<CourseReadModel> Project(IQueryable<Course> query)
    {
        return query.Select(course => new CourseReadModel(
            course.Id,
            course.Code,
            course.Name,
            course.Description,
            course.AcademicYear,
            course.Section,
            course.IsActive,
            _dbContext.CourseEnrollments.Count(enrollment =>
                enrollment.CourseId == course.Id && enrollment.IsActive),
            _dbContext.TeachingAssignments.Count(assignment =>
                assignment.CourseId == course.Id && assignment.IsActive),
            course.CreatedAtUtc,
            course.UpdatedAtUtc));
    }
}
