using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions", table =>
            table.HasCheckConstraint(
                "CK_Submissions_MarksAwarded",
                "\"MarksAwarded\" IS NULL OR \"MarksAwarded\" >= 0"));

        builder.HasKey(submission => submission.Id);

        builder.Property(submission => submission.AnswerText)
            .HasMaxLength(ValidationConstants.SubmissionAnswerMaxLength)
            .IsRequired();

        builder.Property(submission => submission.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(SubmissionStatus.Submitted);

        builder.Property(submission => submission.MarksAwarded)
            .HasPrecision(7, 2);

        builder.Property(submission => submission.Feedback)
            .HasMaxLength(ValidationConstants.FeedbackMaxLength);

        builder.Property(submission => submission.Version)
            .IsRowVersion();

        builder.HasIndex(submission => new
        {
            submission.AssignmentId,
            submission.StudentId
        })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasIndex(submission => new
        {
            submission.AssignmentId,
            submission.Status
        });

        builder.HasIndex(submission => new
        {
            submission.StudentId,
            submission.LastSubmittedAtUtc
        });

        builder.HasOne(submission => submission.Assignment)
            .WithMany()
            .HasForeignKey(submission => submission.AssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(submission => submission.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(submission => submission.GradedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(submission => !submission.IsDeleted);
    }
}
