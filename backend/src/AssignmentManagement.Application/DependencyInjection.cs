using Microsoft.Extensions.DependencyInjection;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Mappings;
using AssignmentManagement.Application.Services;

namespace AssignmentManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(
            configuration => { },
            typeof(CourseMappingProfile).Assembly);

        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<ISubjectService, SubjectService>();

        return services;
    }
}
