using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Dtos.RequestDtos.Auth;

namespace AssignmentManagement.UnitTests.Validation;

public sealed class AuthRequestValidationTests
{
    [Fact]
    public void LoginRequest_WithValidCredentials_ShouldPassValidation()
    {
        var request = new LoginRequest
        {
            Email = "teacher@example.com",
            Password = "Password123!"
        };

        Assert.Empty(Validate(request));
    }

    [Theory]
    [InlineData("", "Password123!")]
    [InlineData("not-an-email", "Password123!")]
    [InlineData("teacher@example.com", "")]
    public void LoginRequest_WithInvalidCredentials_ShouldFailValidation(
        string email,
        string password)
    {
        var request = new LoginRequest { Email = email, Password = password };

        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void RefreshTokenRequest_WithoutToken_ShouldFailValidation()
    {
        Assert.NotEmpty(Validate(new RefreshTokenRequest()));
    }

    private static IReadOnlyCollection<ValidationResult> Validate(object value)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(value, new ValidationContext(value), results, true);
        return results;
    }
}
