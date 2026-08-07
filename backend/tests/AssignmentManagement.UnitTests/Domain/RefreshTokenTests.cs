using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class RefreshTokenTests
{
    [Fact]
    public void NewToken_ShouldBeActiveBeforeExpiry()
    {
        var createdAtUtc = DateTimeOffset.Parse("2026-08-07T10:00:00Z");
        var token = new RefreshToken(
            Guid.NewGuid(), "hash", createdAtUtc, createdAtUtc.AddDays(7));

        Assert.True(token.IsActive(createdAtUtc.AddDays(1)));
    }

    [Fact]
    public void Revoke_ShouldDeactivateTokenAndRecordReplacement()
    {
        var createdAtUtc = DateTimeOffset.Parse("2026-08-07T10:00:00Z");
        var replacementId = Guid.NewGuid();
        var token = new RefreshToken(
            Guid.NewGuid(), "hash", createdAtUtc, createdAtUtc.AddDays(7));

        token.Revoke(createdAtUtc.AddHours(1), replacementId);

        Assert.False(token.IsActive(createdAtUtc.AddHours(2)));
        Assert.Equal(replacementId, token.ReplacedByTokenId);
    }

    [Fact]
    public void Constructor_WithInvalidExpiry_ShouldFail()
    {
        var createdAtUtc = DateTimeOffset.Parse("2026-08-07T10:00:00Z");

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            new RefreshToken(Guid.NewGuid(), "hash", createdAtUtc, createdAtUtc));
    }
}
