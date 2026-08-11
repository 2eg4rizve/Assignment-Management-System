using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Application.Common.Constants;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Users;

public sealed record CreateUserRequest
{
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

    public Guid? StudentCourseId { get; init; }

    [RegularExpression(@"^\d{2}$", ErrorMessage = "Year must contain two digits.")]
    public string? CodeYear { get; init; }

    [RegularExpression(@"^\d{2}$", ErrorMessage = "Semester must contain two digits.")]
    public string? CodeSemester { get; init; }
}

public sealed record UpdateUserRequest
{
    private const string StudentCodePattern = @"^[A-Za-z]\d{6}$";
    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string FirstName { get; init; } = string.Empty;

    [Required, StringLength(ValidationConstants.NameMaxLength)]
    public string LastName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(ValidationConstants.EmailMaxLength)]
    public string Email { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    [StringLength(30), RegularExpression(StudentCodePattern,
        ErrorMessage = "Student ID must use a format such as C263001.")]
    public string? StudentCode { get; init; }

    [StringLength(30), RegularExpression(@"^[A-Za-z]\d{6}$",
        ErrorMessage = "Teacher ID must use a format such as T263001.")]
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
    [StringLength(30)]
    public string? StudentCode { get; init; }

    [StringLength(30)]
    public string? TeacherCode { get; init; }

    public UserRole? Role { get; init; }

    public bool? IsActive { get; init; }

    public DateTimeOffset? CreatedFromUtc { get; init; }

    public DateTimeOffset? CreatedToUtc { get; init; }
}
