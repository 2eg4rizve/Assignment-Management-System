using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class AssignmentConfiguration : IEntityTypeConfiguration<DomainAssignment>
{
    public void Configure(EntityTypeBuilder<DomainAssignment> builder)
    {
        builder.ToTable("Assignments", table =>
            table.HasCheckConstraint(
                "CK_Assignments_MaximumMarks",
                "\"MaximumMarks\" > 0"));

        builder.HasKey(assignment => assignment.Id);

        builder.Property(assignment => assignment.Title)
            .HasMaxLength(ValidationConstants.AssignmentTitleMaxLength)
            .IsRequired();

        builder.Property(assignment => assignment.Description)
            .HasMaxLength(ValidationConstants.AssignmentDescriptionMaxLength)
            .IsRequired();

        builder.Property(assignment => assignment.MaximumMarks)
            .HasPrecision(7, 2);

        builder.Property(assignment => assignment.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(AssignmentStatus.Draft);

        builder.Property(assignment => assignment.Version)
            .IsRowVersion();

        builder.HasIndex(assignment => new
        {
            assignment.TeachingAssignmentId,
            assignment.Status,
            assignment.DeadlineUtc
        });

        builder.HasOne(assignment => assignment.TeachingAssignment)
            .WithMany()
            .HasForeignKey(assignment => assignment.TeachingAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(assignment => !assignment.IsDeleted);
    }
}
