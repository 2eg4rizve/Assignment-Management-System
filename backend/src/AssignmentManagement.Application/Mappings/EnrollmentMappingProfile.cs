using AssignmentManagement.Application.Dtos.ResponseDtos.Common;
using AssignmentManagement.Application.Dtos.ResponseDtos.Enrollments;
using AssignmentManagement.Application.Enrollments.Models;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class EnrollmentMappingProfile : Profile
{
    public EnrollmentMappingProfile()
    {
        CreateMap<EnrollmentReadModel, EnrollmentResponse>(MemberList.None)
            .ConstructUsing(source => new EnrollmentResponse(
                source.Id,
                new UserSummaryResponse(source.StudentId, source.StudentFullName, source.StudentEmail),
                new CourseSummaryResponse(
                    source.CourseId,
                    source.CourseCode,
                    source.CourseName,
                    source.AcademicYear,
                    source.Section),
                source.EnrolledAtUtc,
                source.IsActive,
                source.CreatedAtUtc,
                source.UpdatedAtUtc));
    }
}
