using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Application.Common.Constants;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Users;

public sealed record CreateUserRequest
{
    private const string StudentCodePattern = @"^[A-Za-z]{1,10}-\d{2}-\d{2}-\d{3,5}$";
    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string LastName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    [StringLength(30), RegularExpression(StudentCodePattern,
        ErrorMessage = "Student ID must use a format such as CSE-26-03-001.")]
    public string? StudentCode { get; init; }

    [StringLength(30), RegularExpression(@"^T-[A-Za-z]{1,10}-\d{2}-\d{3,5}$",
        ErrorMessage = "Teacher ID must use a format such as T-CSE-26-001.")]
    public string? TeacherCode { get; init; }
}

public sealed record UpdateUserRequest
{
    private const string StudentCodePattern = @"^[A-Za-z]{1,10}-\d{2}-\d{2}-\d{3,5}$";
    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string LastName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    [StringLength(30), RegularExpression(StudentCodePattern,
        ErrorMessage = "Student ID must use a format such as CSE-26-03-001.")]
    public string? StudentCode { get; init; }

    [StringLength(30), RegularExpression(@"^T-[A-Za-z]{1,10}-\d{2}-\d{3,5}$",
        ErrorMessage = "Teacher ID must use a format such as T-CSE-26-001.")]
    public string? TeacherCode { get; init; }

    public bool IsActive { get; init; }
}

public sealed record AdminResetPasswordRequest
{
    [Required, MinLength(8)]
    public string NewPassword { get; init; } = string.Empty;
}

public sealed record UserQueryRequest : PaginationRequest
{
    public UserRole? Role { get; init; }

    public bool? IsActive { get; init; }

    public DateTimeOffset? CreatedFromUtc { get; init; }

    public DateTimeOffset? CreatedToUtc { get; init; }
}
