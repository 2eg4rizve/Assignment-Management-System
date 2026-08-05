using AssignmentManagement.Infrastructure.Identity;
using AssignmentManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Course> Courses => Set<Course>();

    public DbSet<Subject> Subjects => Set<Subject>();

    public DbSet<TeachingAssignment> TeachingAssignments => Set<TeachingAssignment>();

    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();

    public DbSet<Domain.Entities.Assignment> Assignments => Set<Domain.Entities.Assignment>();

    public DbSet<Submission> Submissions => Set<Submission>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
