using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(user => user.FirstName)
            .HasMaxLength(ValidationConstants.NameMaxLength)
            .IsRequired();

        builder.Property(user => user.LastName)
            .HasMaxLength(ValidationConstants.NameMaxLength)
            .IsRequired();

        builder.Property(user => user.StudentCode)
            .HasMaxLength(30);

        builder.HasIndex(user => user.StudentCode)
            .IsUnique();

        builder.Property(user => user.IsActive)
            .HasDefaultValue(true);
    }
}
