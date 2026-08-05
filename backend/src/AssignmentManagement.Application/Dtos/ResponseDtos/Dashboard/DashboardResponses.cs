using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;

public sealed record AdminDashboardResponse(
    int TotalUsers,
    int TotalTeachers,
    int TotalStudents,
    int TotalCourses,
    int TotalSubjects,
    int PublishedAssignments,
    int TotalSubmissions);

public sealed record TeacherDashboardResponse(
    int TotalAssignments,
    int PublishedAssignments,
    int SubmissionsAwaitingReview,
    IReadOnlyCollection<SubmissionListItemResponse> RecentSubmissions);

public sealed record StudentDashboardResponse(
    int OpenAssignments,
    int DueSoonAssignments,
    int SubmittedAssignments,
    int GradedSubmissions,
    IReadOnlyCollection<AssignmentListItemResponse> UpcomingAssignments);
