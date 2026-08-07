using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public sealed class DashboardRepository(ApplicationDbContext dbContext) : IDashboardRepository
{
    private const int SummaryItemCount = 5;

    public async Task<AdminDashboardResponse> GetAdminAsync(CancellationToken cancellationToken = default)
    {
        var totalUsers = await dbContext.Users.CountAsync(cancellationToken);
        var totalTeachers = await CountUsersInRoleAsync("TEACHER", cancellationToken);
        var totalStudents = await CountUsersInRoleAsync("STUDENT", cancellationToken);
        var totalCourses = await dbContext.Courses.CountAsync(cancellationToken);
        var totalSubjects = await dbContext.Subjects.CountAsync(cancellationToken);
        var publishedAssignments = await dbContext.Assignments.CountAsync(
            item => item.Status == AssignmentStatus.Published, cancellationToken);
        var totalSubmissions = await dbContext.Submissions.CountAsync(cancellationToken);
        return new AdminDashboardResponse(totalUsers, totalTeachers, totalStudents, totalCourses,
            totalSubjects, publishedAssignments, totalSubmissions);
    }

    public async Task<TeacherDashboardResponse> GetTeacherAsync(Guid teacherId,
        CancellationToken cancellationToken = default)
    {
        var assignments = dbContext.Assignments.Where(
            item => item.TeachingAssignment.TeacherId == teacherId);
        var totalAssignments = await assignments.CountAsync(cancellationToken);
        var publishedAssignments = await assignments.CountAsync(
            item => item.Status == AssignmentStatus.Published, cancellationToken);
        var submissions = dbContext.Submissions.Where(
            item => item.Assignment.TeachingAssignment.TeacherId == teacherId);
        var awaitingReview = await submissions.CountAsync(
            item => item.Status == SubmissionStatus.Submitted, cancellationToken);
        var recent = await (from item in submissions.AsNoTracking()
            let student = dbContext.Users.First(user => user.Id == item.StudentId)
            orderby item.LastSubmittedAtUtc descending
            select new SubmissionListItemResponse(item.Id, item.AssignmentId, item.Assignment.Title,
                item.StudentId, (student.FirstName + " " + student.LastName).Trim(),
                student.Email ?? string.Empty, item.Status, item.SubmittedAtUtc,
                item.LastSubmittedAtUtc, item.MarksAwarded, item.Assignment.MaximumMarks,
                item.LastSubmittedAtUtc > item.Assignment.DeadlineUtc))
            .Take(SummaryItemCount).ToListAsync(cancellationToken);
        return new TeacherDashboardResponse(totalAssignments, publishedAssignments, awaitingReview, recent);
    }

    public async Task<StudentDashboardResponse> GetStudentAsync(Guid studentId, DateTimeOffset utcNow,
        CancellationToken cancellationToken = default)
    {
        var assignments = dbContext.Assignments.Where(item =>
            item.Status == AssignmentStatus.Published && item.DeadlineUtc >= utcNow &&
            item.TeachingAssignment.Course.IsActive &&
            dbContext.CourseEnrollments.Any(enrollment => enrollment.StudentId == studentId &&
                enrollment.CourseId == item.TeachingAssignment.CourseId && enrollment.IsActive));
        var openAssignments = await assignments.CountAsync(cancellationToken);
        var dueSoonCutoff = utcNow.AddDays(7);
        var dueSoonAssignments = await assignments.CountAsync(
            item => item.DeadlineUtc <= dueSoonCutoff, cancellationToken);
        var studentSubmissions = dbContext.Submissions.Where(item => item.StudentId == studentId);
        var submittedAssignments = await studentSubmissions.CountAsync(cancellationToken);
        var gradedSubmissions = await studentSubmissions.CountAsync(
            item => item.Status == SubmissionStatus.Graded, cancellationToken);
        var upcoming = await (from item in assignments.AsNoTracking()
            let teacher = dbContext.Users.First(user => user.Id == item.TeachingAssignment.TeacherId)
            let submission = dbContext.Submissions.FirstOrDefault(value =>
                value.AssignmentId == item.Id && value.StudentId == studentId)
            orderby item.DeadlineUtc
            select new AssignmentListItemResponse(item.Id, item.Title,
                item.TeachingAssignment.CourseId, item.TeachingAssignment.Course.Name,
                item.TeachingAssignment.SubjectId, item.TeachingAssignment.Subject.Name,
                item.TeachingAssignment.TeacherId, (teacher.FirstName + " " + teacher.LastName).Trim(),
                item.DeadlineUtc, item.MaximumMarks, item.Status, item.AllowResubmission, null,
                submission != null, submission == null ? null : submission.Status, item.CreatedAtUtc))
            .Take(SummaryItemCount).ToListAsync(cancellationToken);
        return new StudentDashboardResponse(openAssignments, dueSoonAssignments,
            submittedAssignments, gradedSubmissions, upcoming);
    }

    private Task<int> CountUsersInRoleAsync(string normalizedRoleName,
        CancellationToken cancellationToken) =>
        (from user in dbContext.Users
         join userRole in dbContext.UserRoles on user.Id equals userRole.UserId
         join role in dbContext.Roles on userRole.RoleId equals role.Id
         where role.NormalizedName == normalizedRoleName
         select user.Id).Distinct().CountAsync(cancellationToken);
}
