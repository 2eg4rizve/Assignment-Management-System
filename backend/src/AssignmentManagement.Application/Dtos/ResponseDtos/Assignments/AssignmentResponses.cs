using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;

public sealed record AssignmentListItemResponse(
    Guid Id,
    string Title,
    Guid CourseId,
    string CourseName,
    Guid SubjectId,
    string SubjectName,
    Guid TeacherId,
    string TeacherName,
    DateTimeOffset DeadlineUtc,
    decimal MaximumMarks,
    AssignmentStatus Status,
    bool AllowResubmission,
    int? SubmissionCount,
    bool? HasSubmitted,
    SubmissionStatus? StudentSubmissionStatus,
    DateTimeOffset CreatedAtUtc);

public sealed record AssignmentDetailResponse(
    Guid Id,
    string Title,
    string Description,
    CourseSummaryResponse Course,
    SubjectSummaryResponse Subject,
    UserSummaryResponse Teacher,
    DateTimeOffset DeadlineUtc,
    decimal MaximumMarks,
    AssignmentStatus Status,
    bool AllowResubmission,
    DateTimeOffset? PublishedAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc,
    string RowVersion,
    SubmissionSummaryResponse? SubmissionSummary);

public sealed record AssignmentMutationResponse(
    Guid Id,
    AssignmentStatus Status,
    DateTimeOffset? PublishedAtUtc,
    DateTimeOffset? UpdatedAtUtc,
    string RowVersion);
