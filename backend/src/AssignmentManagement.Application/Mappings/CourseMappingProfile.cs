using AssignmentManagement.Application.Courses.Models;
using AssignmentManagement.Application.Dtos.ResponseDtos.Courses;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class CourseMappingProfile : Profile
{
    public CourseMappingProfile()
    {
        CreateMap<CourseReadModel, CourseResponse>();
    }
}
