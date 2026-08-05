using AssignmentManagement.Application.Dtos.ResponseDtos.Common;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.TeachingAssignments;

public sealed record TeachingAssignmentResponse(
    Guid Id,
    UserSummaryResponse Teacher,
    CourseSummaryResponse Course,
    SubjectSummaryResponse Subject,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
