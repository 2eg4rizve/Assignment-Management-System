using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Dtos.RequestDtos.Users;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.UnitTests.Validation;

public sealed class UserRequestValidationTests
{
    [Fact]
    public void CreateUserRequest_WithValidValues_ShouldPassValidation()
    {
        var request = new CreateUserRequest
        {
            FirstName = "Amina",
            LastName = "Rahman",
            Email = "amina@example.com",
            Password = "Password123!",
            Role = UserRole.Teacher
        };

        Assert.Empty(Validate(request));
    }

    [Theory]
    [InlineData("", "Rahman", "amina@example.com", "Password123!", UserRole.Teacher)]
    [InlineData("Amina", "", "amina@example.com", "Password123!", UserRole.Teacher)]
    [InlineData("Amina", "Rahman", "invalid-email", "Password123!", UserRole.Teacher)]
    [InlineData("Amina", "Rahman", "amina@example.com", "short", UserRole.Teacher)]
    [InlineData("Amina", "Rahman", "amina@example.com", "Password123!", (UserRole)99)]
    public void CreateUserRequest_WithInvalidValues_ShouldFailValidation(
        string firstName,
        string lastName,
        string email,
        string password,
        UserRole role)
    {
        var request = new CreateUserRequest
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Password = password,
            Role = role
        };

        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void ResetPasswordRequest_WithShortPassword_ShouldFailValidation()
    {
        Assert.NotEmpty(Validate(new AdminResetPasswordRequest { NewPassword = "short" }));
    }

    private static IReadOnlyCollection<ValidationResult> Validate(object value)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(value, new ValidationContext(value), results, true);
        return results;
    }
}
