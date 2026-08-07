using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Dtos.ResponseDtos.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
public sealed class DashboardController(IDashboardService service) : ControllerBase
{
    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
    public async Task<ActionResult<AdminDashboardResponse>> GetAdmin(
        CancellationToken cancellationToken) =>
        Ok(await service.GetAdminAsync(cancellationToken));

    [HttpGet("teacher")]
    [Authorize(Policy = AuthorizationPolicies.RequireTeacher)]
    public async Task<ActionResult<TeacherDashboardResponse>> GetTeacher(
        CancellationToken cancellationToken) =>
        Ok(await service.GetTeacherAsync(cancellationToken));

    [HttpGet("student")]
    [Authorize(Policy = AuthorizationPolicies.RequireStudent)]
    public async Task<ActionResult<StudentDashboardResponse>> GetStudent(
        CancellationToken cancellationToken) =>
        Ok(await service.GetStudentAsync(cancellationToken));
}
