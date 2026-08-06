using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AssignmentManagement.Application.Dtos.ResponseDtos.TeachingAssignments;
using AssignmentManagement.Application.TeachingAssignments.Models;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class TeachingAssignmentMappingProfile : Profile
{
    public TeachingAssignmentMappingProfile()
    {
        CreateMap<TeachingAssignmentReadModel, TeachingAssignmentResponse>(MemberList.None)
            .ConstructUsing(source => new TeachingAssignmentResponse(
                source.Id,
                new UserSummaryResponse(source.TeacherId, source.TeacherFullName, source.TeacherEmail),
                new CourseSummaryResponse(
                    source.CourseId,
                    source.CourseCode,
                    source.CourseName,
                    source.AcademicYear,
                    source.Section),
                new SubjectSummaryResponse(source.SubjectId, source.SubjectCode, source.SubjectName),
                source.IsActive,
                source.CreatedAtUtc,
                source.UpdatedAtUtc));
    }
}
