using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");
        builder.HasKey(course => course.Id);

        builder.Property(course => course.Code)
            .HasMaxLength(ValidationConstants.CodeMaxLength)
            .IsRequired();

        builder.Property(course => course.Name)
            .HasMaxLength(ValidationConstants.CourseOrSubjectNameMaxLength)
            .IsRequired();

        builder.Property(course => course.Description)
            .HasMaxLength(ValidationConstants.ShortDescriptionMaxLength);

        builder.Property(course => course.AcademicYear)
            .HasMaxLength(ValidationConstants.AcademicYearMaxLength);

        builder.Property(course => course.Section)
            .HasMaxLength(ValidationConstants.SectionMaxLength);

        builder.HasIndex(course => course.Code)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasQueryFilter(course => !course.IsDeleted);
    }
}
