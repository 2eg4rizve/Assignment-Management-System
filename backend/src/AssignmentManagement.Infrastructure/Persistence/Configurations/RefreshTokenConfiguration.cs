using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentManagement.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(token => token.Id);

        builder.Property(token => token.TokenHash)
            .HasMaxLength(512)
            .IsRequired();

        builder.HasIndex(token => token.TokenHash)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");
        builder.HasIndex(token => new { token.UserId, token.ExpiresAtUtc });

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(token => token.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<RefreshToken>()
            .WithMany()
            .HasForeignKey(token => token.ReplacedByTokenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(token => !token.IsDeleted);
    }
}
