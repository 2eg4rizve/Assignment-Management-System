using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/assignments")]
[Authorize]
public sealed class AssignmentsController(IAssignmentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PagedResponse<AssignmentListItemResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<AssignmentListItemResponse>>> GetAll(
        [FromQuery] AssignmentQueryRequest request, CancellationToken cancellationToken) =>
        Ok(await service.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<AssignmentDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssignmentDetailResponse>> GetById(
        Guid id, CancellationToken cancellationToken) =>
        Ok(await service.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    [ProducesResponseType<AssignmentDetailResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<AssignmentDetailResponse>> Create(
        [FromBody] CreateAssignmentRequest request, CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<AssignmentMutationResponse>> Update(
        Guid id, [FromBody] UpdateAssignmentRequest request, CancellationToken cancellationToken) =>
        Ok(await service.UpdateAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/publish")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<AssignmentMutationResponse>> Publish(
        Guid id, [FromBody] PublishAssignmentRequest request, CancellationToken cancellationToken) =>
        Ok(await service.PublishAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/close")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<AssignmentMutationResponse>> Close(
        Guid id, [FromBody] CloseAssignmentRequest request, CancellationToken cancellationToken) =>
        Ok(await service.CloseAsync(id, request, cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(
        Guid id, [FromQuery] string rowVersion, CancellationToken cancellationToken)
    {
        await service.DeleteAsync(id, rowVersion, cancellationToken);
        return NoContent();
    }
}
