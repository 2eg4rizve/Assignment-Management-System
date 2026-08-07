using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Infrastructure.Identity;
using AssignmentManagement.Infrastructure.Persistence;
using AssignmentManagement.Infrastructure.Persistence.Repositories;
using AssignmentManagement.Infrastructure.Services;
using AssignmentManagement.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AssignmentManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        var jwtSection = configuration.GetSection(JwtSettings.SectionName);
        services.Configure<JwtSettings>(options =>
        {
            options.Issuer = jwtSection[nameof(JwtSettings.Issuer)] ?? string.Empty;
            options.Audience = jwtSection[nameof(JwtSettings.Audience)] ?? string.Empty;
            options.Secret = jwtSection[nameof(JwtSettings.Secret)] ?? string.Empty;
            options.AccessTokenMinutes = int.TryParse(
                jwtSection[nameof(JwtSettings.AccessTokenMinutes)], out var accessTokenMinutes)
                ? accessTokenMinutes
                : 15;
            options.RefreshTokenDays = int.TryParse(
                jwtSection[nameof(JwtSettings.RefreshTokenDays)], out var refreshTokenDays)
                ? refreshTokenDays
                : 7;
        });
        var demoSeedSection = configuration.GetSection(DemoSeedOptions.SectionName);
        services.Configure<DemoSeedOptions>(options =>
        {
            options.Enabled = bool.TryParse(demoSeedSection[nameof(DemoSeedOptions.Enabled)], out var enabled) && enabled;
            options.Password = demoSeedSection[nameof(DemoSeedOptions.Password)] ?? string.Empty;
        });

        services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Lockout.MaxFailedAccessAttempts = 5;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<ISubjectRepository, SubjectRepository>();
        services.AddScoped<ITeachingAssignmentRepository, TeachingAssignmentRepository>();
        services.AddScoped<ICourseEnrollmentRepository, CourseEnrollmentRepository>();
        services.AddScoped<IAssignmentRepository, AssignmentRepository>();
        services.AddScoped<ISubmissionRepository, SubmissionRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
