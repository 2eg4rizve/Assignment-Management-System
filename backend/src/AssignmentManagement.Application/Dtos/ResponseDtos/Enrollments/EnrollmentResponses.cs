using AssignmentManagement.Application.Dtos.ResponseDtos.Common;

namespace AssignmentManagement.Application.Dtos.ResponseDtos.Enrollments;

public sealed record EnrollmentResponse(
    Guid Id,
    UserSummaryResponse Student,
    CourseSummaryResponse Course,
    DateTimeOffset EnrolledAtUtc,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
