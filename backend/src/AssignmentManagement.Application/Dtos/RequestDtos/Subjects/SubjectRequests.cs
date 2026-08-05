using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Application.Common.Models;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Subjects;

public sealed record CreateSubjectRequest
{
    [Required]
    [StringLength(ValidationConstants.CodeMaxLength)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(ValidationConstants.CourseOrSubjectNameMaxLength)]
    public string Name { get; init; } = string.Empty;

    [StringLength(ValidationConstants.ShortDescriptionMaxLength)]
    public string? Description { get; init; }
}

public sealed record UpdateSubjectRequest
{
    [Required]
    [StringLength(ValidationConstants.CodeMaxLength)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(ValidationConstants.CourseOrSubjectNameMaxLength)]
    public string Name { get; init; } = string.Empty;

    [StringLength(ValidationConstants.ShortDescriptionMaxLength)]
    public string? Description { get; init; }

    public bool IsActive { get; init; }
}

public sealed record SubjectQueryRequest : PaginationRequest
{
    public bool? IsActive { get; init; }
}
