using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize(Policy = AuthorizationPolicies.RequireStudent)]
public sealed class StudentSubmissionsController(ISubmissionService service) : ControllerBase
{
    [HttpGet("my-submissions")]
    public async Task<ActionResult<PagedResponse<SubmissionListItemResponse>>> GetMine(
        [FromQuery] SubmissionQueryRequest request, CancellationToken cancellationToken) =>
        Ok(await service.GetPagedAsync(request, cancellationToken));

    [HttpGet("assignments/{assignmentId:guid}/submission")]
    public async Task<ActionResult<SubmissionDetailResponse>> GetForAssignment(
        Guid assignmentId, CancellationToken cancellationToken) =>
        Ok(await service.GetMineByAssignmentAsync(assignmentId, cancellationToken));

    [HttpPost("assignments/{assignmentId:guid}/submission")]
    public async Task<ActionResult<SubmissionDetailResponse>> Create(Guid assignmentId,
        [FromBody] CreateSubmissionRequest request, CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(assignmentId, request, cancellationToken);
        return CreatedAtAction(nameof(GetForAssignment), new { assignmentId }, response);
    }

    [HttpPut("assignments/{assignmentId:guid}/submission")]
    public async Task<ActionResult<SubmissionMutationResponse>> Update(Guid assignmentId,
        [FromBody] UpdateSubmissionRequest request, CancellationToken cancellationToken) =>
        Ok(await service.UpdateMineByAssignmentAsync(assignmentId, request, cancellationToken));
}
