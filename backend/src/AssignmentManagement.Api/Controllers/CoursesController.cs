using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Courses;
using AssignmentManagement.Application.Dtos.ResponseDtos.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/courses")]
[Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
public sealed class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PagedResponse<CourseResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResponse<CourseResponse>>> GetAll(
        [FromQuery] CourseQueryRequest request,
        CancellationToken cancellationToken)
    {
        var response = await courseService.GetPagedAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<CourseResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CourseResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await courseService.GetByIdAsync(id, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType<CourseResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CourseResponse>> Create(
        [FromBody] CreateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var response = await courseService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = response.Id },
            response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<CourseResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CourseResponse>> Update(
        Guid id,
        [FromBody] UpdateCourseRequest request,
        CancellationToken cancellationToken)
    {
        var response = await courseService.UpdateAsync(id, request, cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await courseService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
