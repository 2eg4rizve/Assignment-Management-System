using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class TeachingAssignmentConfiguration
    : IEntityTypeConfiguration<TeachingAssignment>
{
    public void Configure(EntityTypeBuilder<TeachingAssignment> builder)
    {
        builder.ToTable("TeachingAssignments");
        builder.HasKey(item => item.Id);

        builder.HasIndex(item => new
        {
            item.TeacherId,
            item.CourseId,
            item.SubjectId
        })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(item => item.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.Course)
            .WithMany()
            .HasForeignKey(item => item.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.Subject)
            .WithMany()
            .HasForeignKey(item => item.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(item => !item.IsDeleted);
    }
}
