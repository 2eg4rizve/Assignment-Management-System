using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/submissions")]
[Authorize]
public sealed class SubmissionsController(ISubmissionService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<SubmissionListItemResponse>>> GetAll(
        [FromQuery] SubmissionQueryRequest request, CancellationToken cancellationToken) =>
        Ok(await service.GetPagedAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubmissionDetailResponse>> GetById(
        Guid id, CancellationToken cancellationToken) =>
        Ok(await service.GetByIdAsync(id, cancellationToken));

    [HttpPost("{id:guid}/status")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<SubmissionMutationResponse>> UpdateStatus(Guid id,
        [FromBody] UpdateSubmissionStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await service.UpdateStatusAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/grade")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<SubmissionMutationResponse>> Grade(Guid id,
        [FromBody] GradeSubmissionRequest request, CancellationToken cancellationToken) =>
        Ok(await service.GradeAsync(id, request, cancellationToken));
}
