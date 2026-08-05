using AssignmentManagement.Application.Dtos.ResponseDtos.Subjects;
using AssignmentManagement.Application.Subjects.Models;
using AutoMapper;

namespace AssignmentManagement.Application.Mappings;

public sealed class SubjectMappingProfile : Profile
{
    public SubjectMappingProfile()
    {
        CreateMap<SubjectReadModel, SubjectResponse>();
    }
}
