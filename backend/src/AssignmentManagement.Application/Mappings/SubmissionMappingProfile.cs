using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;
using AssignmentManagement.Application.Submissions.Models;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class SubmissionMappingProfile : Profile
{
    public SubmissionMappingProfile()
    {
        CreateMap<SubmissionListReadModel, SubmissionListItemResponse>();
        CreateMap<SubmissionDetailReadModel, SubmissionDetailResponse>(MemberList.None)
            .ConstructUsing(source => new SubmissionDetailResponse(source.Id,
                new AssignmentSummaryResponse(source.AssignmentId, source.AssignmentTitle,
                    source.AssignmentDeadlineUtc, source.MaximumMarks, source.AssignmentStatus,
                    new CourseSummaryResponse(source.CourseId, source.CourseCode, source.CourseName,
                        source.AcademicYear, source.Section),
                    new SubjectSummaryResponse(source.SubjectId, source.SubjectCode, source.SubjectName)),
                new UserSummaryResponse(source.StudentId, source.StudentName, source.StudentEmail),
                source.AnswerText, source.Status, source.SubmittedAtUtc, source.LastSubmittedAtUtc,
                source.MarksAwarded, source.MaximumMarks, source.Feedback, source.GradedAtUtc,
                source.GradedByName, Convert.ToBase64String(BitConverter.GetBytes(source.Version))));
    }
}
