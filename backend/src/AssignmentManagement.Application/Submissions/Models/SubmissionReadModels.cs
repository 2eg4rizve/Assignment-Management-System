using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Submissions.Models;

public sealed record SubmissionListReadModel(
    Guid Id, Guid AssignmentId, string AssignmentTitle, Guid StudentId,
    string StudentName, string StudentEmail, SubmissionStatus Status,
    DateTimeOffset SubmittedAtUtc, DateTimeOffset LastSubmittedAtUtc,
    decimal? MarksAwarded, decimal MaximumMarks, bool IsLate);

public sealed record SubmissionDetailReadModel(
    Guid Id, Guid AssignmentId, string AssignmentTitle, DateTimeOffset AssignmentDeadlineUtc,
    decimal MaximumMarks, AssignmentStatus AssignmentStatus,
    Guid CourseId, string CourseCode, string CourseName, string? AcademicYear, string? Section,
    Guid SubjectId, string SubjectCode, string SubjectName,
    Guid StudentId, string StudentName, string StudentEmail,
    string AnswerText, SubmissionStatus Status, DateTimeOffset SubmittedAtUtc,
    DateTimeOffset LastSubmittedAtUtc, decimal? MarksAwarded, string? Feedback,
    DateTimeOffset? GradedAtUtc, string? GradedByName, uint Version);
