using AssignmentManagement.Application.Assignments.Models;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class AssignmentMappingProfile : Profile
{
    public AssignmentMappingProfile()
    {
        CreateMap<AssignmentListReadModel, AssignmentListItemResponse>();
        CreateMap<AssignmentDetailReadModel, AssignmentDetailResponse>(MemberList.None)
            .ConstructUsing(source => new AssignmentDetailResponse(
                source.Id,
                source.Title,
                source.Description,
                new CourseSummaryResponse(source.CourseId, source.CourseCode, source.CourseName, source.AcademicYear, source.Section),
                new SubjectSummaryResponse(source.SubjectId, source.SubjectCode, source.SubjectName),
                new UserSummaryResponse(source.TeacherId, source.TeacherName, source.TeacherEmail),
                source.DeadlineUtc,
                source.MaximumMarks,
                source.Status,
                source.AllowResubmission,
                source.PublishedAtUtc,
                source.CreatedAtUtc,
                source.UpdatedAtUtc,
                Convert.ToBase64String(BitConverter.GetBytes(source.Version)),
                CreateSubmissionSummary(source)));
    }

    private static SubmissionSummaryResponse? CreateSubmissionSummary(AssignmentDetailReadModel source) =>
        source.SubmissionId.HasValue &&
        source.SubmissionStatus.HasValue &&
        source.SubmittedAtUtc.HasValue &&
        source.LastSubmittedAtUtc.HasValue
            ? new SubmissionSummaryResponse(
                source.SubmissionId.Value,
                source.SubmissionStatus.Value,
                source.SubmittedAtUtc.Value,
                source.LastSubmittedAtUtc.Value,
                source.MarksAwarded,
                source.Feedback)
            : null;
}
