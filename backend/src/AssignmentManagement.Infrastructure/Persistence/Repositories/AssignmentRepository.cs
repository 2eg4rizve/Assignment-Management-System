using AssignmentManagement.Application.Assignments.Models;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Assignments;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class AssignmentRepository : Repository<DomainAssignment>, IAssignmentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public AssignmentRepository(ApplicationDbContext dbContext, IDateTimeProvider dateTimeProvider)
        : base(dbContext, dateTimeProvider) => _dbContext = dbContext;

    public Task<bool> ActiveTeachingAssignmentBelongsToTeacherAsync(
        Guid teachingAssignmentId, Guid teacherId, CancellationToken cancellationToken = default) =>
        _dbContext.TeachingAssignments.AnyAsync(item =>
            item.Id == teachingAssignmentId && item.TeacherId == teacherId && item.IsActive &&
            item.Course.IsActive && item.Subject.IsActive, cancellationToken);

    public Task<bool> IsOwnedByTeacherAsync(
        Guid assignmentId, Guid teacherId, CancellationToken cancellationToken = default) =>
        _dbContext.Assignments.AnyAsync(item =>
            item.Id == assignmentId && item.TeachingAssignment.TeacherId == teacherId,
            cancellationToken);

    public async Task<(IReadOnlyCollection<AssignmentListReadModel> Items, int TotalCount)> GetPagedAsync(
        AssignmentQueryRequest request, Guid userId, bool isAdmin, bool isTeacher,
        CancellationToken cancellationToken = default)
    {
        var query = VisibleAssignments(userId, isAdmin, isTeacher);
        if (request.Status.HasValue)
            query = query.Where(item => item.Status == request.Status.Value);
        if (request.CourseId.HasValue)
            query = query.Where(item => item.TeachingAssignment.CourseId == request.CourseId.Value);
        if (request.SubjectId.HasValue)
            query = query.Where(item => item.TeachingAssignment.SubjectId == request.SubjectId.Value);
        if (request.TeacherId.HasValue)
            query = query.Where(item => item.TeachingAssignment.TeacherId == request.TeacherId.Value);
        if (request.AllowResubmission.HasValue)
            query = query.Where(item => item.AllowResubmission == request.AllowResubmission.Value);
        if (request.MinimumMarks.HasValue)
            query = query.Where(item => item.MaximumMarks >= request.MinimumMarks.Value);
        if (request.MaximumMarks.HasValue)
            query = query.Where(item => item.MaximumMarks <= request.MaximumMarks.Value);
        if (request.DeadlineFromUtc.HasValue)
            query = query.Where(item => item.DeadlineUtc >= request.DeadlineFromUtc.Value);
        if (request.DeadlineToUtc.HasValue)
            query = query.Where(item => item.DeadlineUtc <= request.DeadlineToUtc.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(item => EF.Functions.ILike(item.Title, pattern) ||
                EF.Functions.ILike(item.Description, pattern) ||
                EF.Functions.ILike(item.TeachingAssignment.Course.Name, pattern) ||
                EF.Functions.ILike(item.TeachingAssignment.Subject.Name, pattern) ||
                _dbContext.Users.Any(teacher =>
                    teacher.Id == item.TeachingAssignment.TeacherId &&
                    teacher.TeacherCode != null && EF.Functions.ILike(teacher.TeacherCode, pattern)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        query = ApplySorting(query, request.SortBy, request.SortDirection);

        var items = await (
            from item in query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            let teacher = _dbContext.Users.First(user => user.Id == item.TeachingAssignment.TeacherId)
            let studentSubmission = _dbContext.Submissions.FirstOrDefault(submission =>
                submission.AssignmentId == item.Id && submission.StudentId == userId)
            select new AssignmentListReadModel(
                item.Id, item.Title,
                item.TeachingAssignment.CourseId, item.TeachingAssignment.Course.Name,
                item.TeachingAssignment.SubjectId, item.TeachingAssignment.Subject.Name,
                item.TeachingAssignment.TeacherId, (teacher.FirstName + " " + teacher.LastName).Trim(),
                item.DeadlineUtc, item.MaximumMarks, item.Status, item.AllowResubmission,
                isAdmin || isTeacher
                    ? _dbContext.Submissions.Count(submission => submission.AssignmentId == item.Id)
                    : null,
                !isAdmin && !isTeacher ? studentSubmission != null : null,
                !isAdmin && !isTeacher && studentSubmission != null ? studentSubmission.Status : null,
                item.CreatedAtUtc)).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<AssignmentDetailReadModel?> GetDetailAsync(
        Guid id, Guid userId, bool isAdmin, bool isTeacher,
        CancellationToken cancellationToken = default) => (
        from item in VisibleAssignments(userId, isAdmin, isTeacher)
        where item.Id == id
        let teacher = _dbContext.Users.First(user => user.Id == item.TeachingAssignment.TeacherId)
        let submission = _dbContext.Submissions.FirstOrDefault(value =>
            value.AssignmentId == item.Id && value.StudentId == userId)
        select new AssignmentDetailReadModel(
            item.Id, item.Title, item.Description,
            item.TeachingAssignment.CourseId, item.TeachingAssignment.Course.Code,
            item.TeachingAssignment.Course.Name, item.TeachingAssignment.Course.AcademicYear,
            item.TeachingAssignment.Course.Section,
            item.TeachingAssignment.SubjectId, item.TeachingAssignment.Subject.Code,
            item.TeachingAssignment.Subject.Name,
            item.TeachingAssignment.TeacherId, (teacher.FirstName + " " + teacher.LastName).Trim(),
            teacher.Email ?? string.Empty,
            item.DeadlineUtc, item.MaximumMarks, item.Status, item.AllowResubmission,
            item.PublishedAtUtc, item.CreatedAtUtc, item.UpdatedAtUtc, item.Version,
            !isAdmin && !isTeacher && submission != null ? submission.Id : null,
            !isAdmin && !isTeacher && submission != null ? submission.Status : null,
            !isAdmin && !isTeacher && submission != null ? submission.SubmittedAtUtc : null,
            !isAdmin && !isTeacher && submission != null ? submission.LastSubmittedAtUtc : null,
            !isAdmin && !isTeacher && submission != null ? submission.MarksAwarded : null,
            !isAdmin && !isTeacher && submission != null ? submission.Feedback : null))
        .SingleOrDefaultAsync(cancellationToken);

    public void SetOriginalVersion(DomainAssignment assignment, uint version) =>
        _dbContext.Entry(assignment).Property(item => item.Version).OriginalValue = version;

    private IQueryable<DomainAssignment> VisibleAssignments(Guid userId, bool isAdmin, bool isTeacher)
    {
        var query = _dbContext.Assignments.AsNoTracking();
        if (isAdmin) return query;
        if (isTeacher)
            return query.Where(item => item.TeachingAssignment.TeacherId == userId);
        return query.Where(item => item.Status == AssignmentStatus.Published &&
            item.TeachingAssignment.Course.IsActive &&
            _dbContext.CourseEnrollments.Any(enrollment => enrollment.StudentId == userId &&
                enrollment.CourseId == item.TeachingAssignment.CourseId && enrollment.IsActive));
    }

    private static IQueryable<DomainAssignment> ApplySorting(
        IQueryable<DomainAssignment> query, AssignmentSortField sortBy, SortDirection direction) =>
        (sortBy, direction) switch
        {
            (AssignmentSortField.Deadline, SortDirection.Asc) => query.OrderBy(item => item.DeadlineUtc),
            (AssignmentSortField.Deadline, SortDirection.Desc) => query.OrderByDescending(item => item.DeadlineUtc),
            (AssignmentSortField.Title, SortDirection.Asc) => query.OrderBy(item => item.Title),
            (AssignmentSortField.Title, SortDirection.Desc) => query.OrderByDescending(item => item.Title),
            (_, SortDirection.Asc) => query.OrderBy(item => item.CreatedAtUtc),
            _ => query.OrderByDescending(item => item.CreatedAtUtc)
        };
}
