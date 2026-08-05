using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Common.Constants;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Dtos.RequestDtos.Courses;

public sealed record CreateCourseRequest
{
    [Required]
    [StringLength(ValidationConstants.CodeMaxLength)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(ValidationConstants.CourseOrSubjectNameMaxLength)]
    public string Name { get; init; } = string.Empty;

    [StringLength(ValidationConstants.ShortDescriptionMaxLength)]
    public string? Description { get; init; }

    [StringLength(ValidationConstants.AcademicYearMaxLength)]
    public string? AcademicYear { get; init; }

    [StringLength(ValidationConstants.SectionMaxLength)]
    public string? Section { get; init; }
}

public sealed record UpdateCourseRequest
{
    [Required]
    [StringLength(ValidationConstants.CodeMaxLength)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(ValidationConstants.CourseOrSubjectNameMaxLength)]
    public string Name { get; init; } = string.Empty;

    [StringLength(ValidationConstants.ShortDescriptionMaxLength)]
    public string? Description { get; init; }

    [StringLength(ValidationConstants.AcademicYearMaxLength)]
    public string? AcademicYear { get; init; }

    [StringLength(ValidationConstants.SectionMaxLength)]
    public string? Section { get; init; }

    public bool IsActive { get; init; }
}

public sealed record CourseQueryRequest : PaginationRequest
{
    public bool? IsActive { get; init; }

    [StringLength(ValidationConstants.AcademicYearMaxLength)]
    public string? AcademicYear { get; init; }
}
