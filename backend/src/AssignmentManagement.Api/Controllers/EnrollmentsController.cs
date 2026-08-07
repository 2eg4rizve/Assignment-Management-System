using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Enrollments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/enrollments")]
[Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
public sealed class EnrollmentsController(ICourseEnrollmentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PagedResponse<EnrollmentResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResponse<EnrollmentResponse>>> GetAll(
        [FromQuery] EnrollmentQueryRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await service.GetPagedAsync(request, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<EnrollmentResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnrollmentResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        return Ok(await service.GetByIdAsync(id, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType<EnrollmentResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EnrollmentResponse>> Create(
        [FromBody] CreateEnrollmentRequest request,
        CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await service.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}
