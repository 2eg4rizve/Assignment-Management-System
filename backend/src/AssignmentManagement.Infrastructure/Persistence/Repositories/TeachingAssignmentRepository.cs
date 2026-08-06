using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;
using AssignmentManagement.Application.TeachingAssignments.Models;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class TeachingAssignmentRepository : Repository<TeachingAssignment>, ITeachingAssignmentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public TeachingAssignmentRepository(
        ApplicationDbContext dbContext,
        IDateTimeProvider dateTimeProvider) : base(dbContext, dateTimeProvider)
    {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsAsync(
        Guid teacherId,
        Guid courseId,
        Guid subjectId,
        Guid? excludingId,
        CancellationToken cancellationToken = default) =>
        _dbContext.TeachingAssignments.AnyAsync(item =>
            item.TeacherId == teacherId &&
            item.CourseId == courseId &&
            item.SubjectId == subjectId &&
            (!excludingId.HasValue || item.Id != excludingId.Value), cancellationToken);

    public Task<bool> TeacherExistsAsync(
        Guid teacherId,
        CancellationToken cancellationToken = default) =>
        (from user in _dbContext.Users
         join userRole in _dbContext.UserRoles on user.Id equals userRole.UserId
         join role in _dbContext.Roles on userRole.RoleId equals role.Id
         where user.Id == teacherId && user.IsActive && role.Name == "Teacher"
         select user).AnyAsync(cancellationToken);

    public Task<bool> ActiveCourseExistsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Courses.AnyAsync(course => course.Id == courseId && course.IsActive, cancellationToken);

    public Task<bool> ActiveSubjectExistsAsync(
        Guid subjectId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Subjects.AnyAsync(subject => subject.Id == subjectId && subject.IsActive, cancellationToken);

    public Task<TeachingAssignmentReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        Project().SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public async Task<(IReadOnlyCollection<TeachingAssignmentReadModel> Items, int TotalCount)> GetPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = Project();

        if (request.TeacherId.HasValue)
            query = query.Where(item => item.TeacherId == request.TeacherId.Value);
        if (request.CourseId.HasValue)
            query = query.Where(item => item.CourseId == request.CourseId.Value);
        if (request.SubjectId.HasValue)
            query = query.Where(item => item.SubjectId == request.SubjectId.Value);
        if (request.IsActive.HasValue)
            query = query.Where(item => item.IsActive == request.IsActive.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(item =>
                EF.Functions.ILike(item.TeacherFullName, pattern) ||
                EF.Functions.ILike(item.TeacherEmail, pattern) ||
                EF.Functions.ILike(item.CourseCode, pattern) ||
                EF.Functions.ILike(item.CourseName, pattern) ||
                EF.Functions.ILike(item.SubjectCode, pattern) ||
                EF.Functions.ILike(item.SubjectName, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(item => item.CourseName)
            .ThenBy(item => item.SubjectName)
            .ThenBy(item => item.TeacherFullName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    private IQueryable<TeachingAssignmentReadModel> Project() =>
        from item in _dbContext.TeachingAssignments.AsNoTracking()
        join teacher in _dbContext.Users.AsNoTracking() on item.TeacherId equals teacher.Id
        select new TeachingAssignmentReadModel(
            item.Id,
            teacher.Id,
            (teacher.FirstName + " " + teacher.LastName).Trim(),
            teacher.Email ?? string.Empty,
            item.Course.Id,
            item.Course.Code,
            item.Course.Name,
            item.Course.AcademicYear,
            item.Course.Section,
            item.Subject.Id,
            item.Subject.Code,
            item.Subject.Name,
            item.IsActive,
            item.CreatedAtUtc,
            item.UpdatedAtUtc);
}
