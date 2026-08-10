using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.TeachingAssignments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/teacher/teaching-assignments")]
[Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
public sealed class TeacherTeachingAssignmentsController(ITeachingAssignmentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<PagedResponse<TeachingAssignmentResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<TeachingAssignmentResponse>>> GetAll(
        [FromQuery] TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken) =>
        Ok(await service.GetCurrentTeacherPagedAsync(request, cancellationToken));
}
