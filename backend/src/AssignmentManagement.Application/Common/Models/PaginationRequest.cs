using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.Common.Models;

public record PaginationRequest
{
    public const int DefaultPageSize = 20;
    public const int MaximumPageSize = 100;

    [Range(1, int.MaxValue)]
    public int PageNumber { get; init; } = 1;

    [Range(1, MaximumPageSize)]
    public int PageSize { get; init; } = DefaultPageSize;

    [StringLength(200)]
    public string? Search { get; init; }
}
