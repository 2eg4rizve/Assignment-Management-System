using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Submissions.Models;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class SubmissionRepository : Repository<Submission>, ISubmissionRepository
{
    private readonly ApplicationDbContext _dbContext;

    public SubmissionRepository(ApplicationDbContext dbContext, IDateTimeProvider dateTimeProvider)
        : base(dbContext, dateTimeProvider) => _dbContext = dbContext;

    public async Task<(IReadOnlyCollection<SubmissionListReadModel> Items, int TotalCount)> GetPagedAsync(
        SubmissionQueryRequest request, Guid userId, bool isAdmin, bool isTeacher,
        CancellationToken cancellationToken = default)
    {
        var query = VisibleSubmissions(userId, isAdmin, isTeacher);
        if (request.AssignmentId.HasValue)
            query = query.Where(item => item.AssignmentId == request.AssignmentId.Value);
        if (request.StudentId.HasValue)
            query = query.Where(item => item.StudentId == request.StudentId.Value);
        if (request.Status.HasValue)
            query = query.Where(item => item.Status == request.Status.Value);
        if (request.SubmittedFromUtc.HasValue)
            query = query.Where(item => item.LastSubmittedAtUtc >= request.SubmittedFromUtc.Value);
        if (request.SubmittedToUtc.HasValue)
            query = query.Where(item => item.LastSubmittedAtUtc <= request.SubmittedToUtc.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        query = request.SortDirection == SortDirection.Asc
            ? query.OrderBy(item => item.LastSubmittedAtUtc)
            : query.OrderByDescending(item => item.LastSubmittedAtUtc);
        var items = await (from item in query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            let student = _dbContext.Users.First(user => user.Id == item.StudentId)
            select new SubmissionListReadModel(item.Id, item.AssignmentId, item.Assignment.Title,
                item.StudentId, (student.FirstName + " " + student.LastName).Trim(), student.Email ?? string.Empty,
                item.Status, item.SubmittedAtUtc, item.LastSubmittedAtUtc,
                isAdmin || isTeacher || item.Status == SubmissionStatus.Graded ? item.MarksAwarded : null,
                item.Assignment.MaximumMarks, item.LastSubmittedAtUtc > item.Assignment.DeadlineUtc))
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public Task<SubmissionDetailReadModel?> GetDetailAsync(Guid id, Guid userId, bool isAdmin,
        bool isTeacher, CancellationToken cancellationToken = default) =>
        (from item in VisibleSubmissions(userId, isAdmin, isTeacher)
         where item.Id == id
         let student = _dbContext.Users.First(user => user.Id == item.StudentId)
         let grader = item.GradedBy.HasValue ? _dbContext.Users.FirstOrDefault(user => user.Id == item.GradedBy) : null
         select new SubmissionDetailReadModel(item.Id, item.AssignmentId, item.Assignment.Title,
             item.Assignment.DeadlineUtc, item.Assignment.MaximumMarks, item.Assignment.Status,
             item.Assignment.TeachingAssignment.CourseId, item.Assignment.TeachingAssignment.Course.Code,
             item.Assignment.TeachingAssignment.Course.Name, item.Assignment.TeachingAssignment.Course.AcademicYear,
             item.Assignment.TeachingAssignment.Course.Section, item.Assignment.TeachingAssignment.SubjectId,
             item.Assignment.TeachingAssignment.Subject.Code, item.Assignment.TeachingAssignment.Subject.Name, item.StudentId,
             (student.FirstName + " " + student.LastName).Trim(), student.Email ?? string.Empty,
             item.AnswerText, item.Status, item.SubmittedAtUtc, item.LastSubmittedAtUtc,
             isAdmin || isTeacher || item.Status == SubmissionStatus.Graded ? item.MarksAwarded : null,
             isAdmin || isTeacher || item.Status == SubmissionStatus.Graded ? item.Feedback : null,
             isAdmin || isTeacher || item.Status == SubmissionStatus.Graded ? item.GradedAtUtc : null,
             isAdmin || isTeacher || item.Status == SubmissionStatus.Graded
                 ? grader == null ? null : (grader.FirstName + " " + grader.LastName).Trim()
                 : null, item.Version))
        .SingleOrDefaultAsync(cancellationToken);

    public Task<bool> CanStudentSubmitAsync(Guid assignmentId, Guid studentId,
        CancellationToken cancellationToken = default) => _dbContext.Assignments.AnyAsync(assignment =>
            assignment.Id == assignmentId && assignment.Status == AssignmentStatus.Published &&
            assignment.TeachingAssignment.Course.IsActive &&
            _dbContext.CourseEnrollments.Any(enrollment => enrollment.CourseId == assignment.TeachingAssignment.CourseId &&
                enrollment.StudentId == studentId && enrollment.IsActive), cancellationToken);

    public Task<bool> CanStudentResubmitAsync(Guid assignmentId, Guid studentId,
        CancellationToken cancellationToken = default) => _dbContext.Assignments.AnyAsync(assignment =>
            assignment.Id == assignmentId && assignment.Status == AssignmentStatus.Published &&
            assignment.AllowResubmission && assignment.TeachingAssignment.Course.IsActive &&
            _dbContext.CourseEnrollments.Any(enrollment => enrollment.CourseId == assignment.TeachingAssignment.CourseId &&
                enrollment.StudentId == studentId && enrollment.IsActive), cancellationToken);

    public Task<bool> IsOwnedByStudentAsync(Guid id, Guid studentId,
        CancellationToken cancellationToken = default) =>
        _dbContext.Submissions.AnyAsync(item => item.Id == id && item.StudentId == studentId, cancellationToken);

    public Task<bool> IsOwnedByTeacherAsync(Guid id, Guid teacherId,
        CancellationToken cancellationToken = default) => _dbContext.Submissions.AnyAsync(item =>
            item.Id == id && item.Assignment.TeachingAssignment.TeacherId == teacherId, cancellationToken);

    public Task<Submission?> GetByAssignmentAndStudentAsync(Guid assignmentId, Guid studentId,
        CancellationToken cancellationToken = default) => _dbContext.Submissions.SingleOrDefaultAsync(
            item => item.AssignmentId == assignmentId && item.StudentId == studentId, cancellationToken);

    public void SetOriginalVersion(Submission submission, uint version) =>
        _dbContext.Entry(submission).Property(item => item.Version).OriginalValue = version;

    private IQueryable<Submission> VisibleSubmissions(Guid userId, bool isAdmin, bool isTeacher)
    {
        var query = _dbContext.Submissions.AsNoTracking();
        if (isAdmin) return query;
        return isTeacher
            ? query.Where(item => item.Assignment.TeachingAssignment.TeacherId == userId)
            : query.Where(item => item.StudentId == userId);
    }
}
