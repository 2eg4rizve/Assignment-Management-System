using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.ToTable("Subjects");
        builder.HasKey(subject => subject.Id);

        builder.Property(subject => subject.Code)
            .HasMaxLength(ValidationConstants.CodeMaxLength)
            .IsRequired();

        builder.Property(subject => subject.Name)
            .HasMaxLength(ValidationConstants.CourseOrSubjectNameMaxLength)
            .IsRequired();

        builder.Property(subject => subject.Description)
            .HasMaxLength(ValidationConstants.ShortDescriptionMaxLength);

        builder.HasIndex(subject => subject.Code)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasQueryFilter(subject => !subject.IsDeleted);
    }
}
