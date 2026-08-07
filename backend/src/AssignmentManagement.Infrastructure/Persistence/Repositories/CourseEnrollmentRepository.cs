using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;
using AssignmentManagement.Application.Enrollments.Models;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class CourseEnrollmentRepository : Repository<CourseEnrollment>, ICourseEnrollmentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public CourseEnrollmentRepository(
        ApplicationDbContext dbContext,
        IDateTimeProvider dateTimeProvider) : base(dbContext, dateTimeProvider)
    {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsAsync(
        Guid studentId,
        Guid courseId,
        CancellationToken cancellationToken = default) =>
        _dbContext.CourseEnrollments.AnyAsync(
            item => item.StudentId == studentId && item.CourseId == courseId,
            cancellationToken);

    public Task<bool> StudentExistsAsync(
        Guid studentId,
        CancellationToken cancellationToken = default) =>
        (from user in _dbContext.Users
         join userRole in _dbContext.UserRoles on user.Id equals userRole.UserId
         join role in _dbContext.Roles on userRole.RoleId equals role.Id
         where user.Id == studentId && user.IsActive && role.Name == "Student"
         select user).AnyAsync(cancellationToken);

    public Task<bool> ActiveCourseExistsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Courses.AnyAsync(
            course => course.Id == courseId && course.IsActive,
            cancellationToken);

    public Task<EnrollmentReadModel?> GetReadModelByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        Project().SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public async Task<(IReadOnlyCollection<EnrollmentReadModel> Items, int TotalCount)> GetPagedAsync(
        EnrollmentQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = Project();

        if (request.StudentId.HasValue)
            query = query.Where(item => item.StudentId == request.StudentId.Value);
        if (request.CourseId.HasValue)
            query = query.Where(item => item.CourseId == request.CourseId.Value);
        if (request.IsActive.HasValue)
            query = query.Where(item => item.IsActive == request.IsActive.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(item =>
                EF.Functions.ILike(item.StudentFullName, pattern) ||
                EF.Functions.ILike(item.StudentEmail, pattern) ||
                EF.Functions.ILike(item.CourseCode, pattern) ||
                EF.Functions.ILike(item.CourseName, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(item => item.CourseName)
            .ThenBy(item => item.StudentFullName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    private IQueryable<EnrollmentReadModel> Project() =>
        from item in _dbContext.CourseEnrollments.AsNoTracking()
        join student in _dbContext.Users.AsNoTracking() on item.StudentId equals student.Id
        select new EnrollmentReadModel(
            item.Id,
            student.Id,
            (student.FirstName + " " + student.LastName).Trim(),
            student.Email ?? string.Empty,
            item.Course.Id,
            item.Course.Code,
            item.Course.Name,
            item.Course.AcademicYear,
            item.Course.Section,
            item.EnrolledAtUtc,
            item.IsActive,
            item.CreatedAtUtc,
            item.UpdatedAtUtc);
}
