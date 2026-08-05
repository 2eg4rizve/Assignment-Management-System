using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class CourseEnrollmentConfiguration
    : IEntityTypeConfiguration<CourseEnrollment>
{
    public void Configure(EntityTypeBuilder<CourseEnrollment> builder)
    {
        builder.ToTable("CourseEnrollments");
        builder.HasKey(enrollment => enrollment.Id);

        builder.HasIndex(enrollment => new
        {
            enrollment.StudentId,
            enrollment.CourseId
        })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(enrollment => enrollment.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(enrollment => enrollment.Course)
            .WithMany()
            .HasForeignKey(enrollment => enrollment.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(enrollment => !enrollment.IsDeleted);
    }
}
