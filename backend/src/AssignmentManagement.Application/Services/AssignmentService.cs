using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Assignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using AutoMapper;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Application.Services;

public sealed class AssignmentService(
    IAssignmentRepository repository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService) : IAssignmentService
{
    public async Task<PagedResponse<AssignmentListItemResponse>> GetPagedAsync(
        AssignmentQueryRequest request, CancellationToken cancellationToken = default)
    {
        var userId = RequireUser();
        var isAdmin = currentUserService.IsInRole("Admin");
        var isTeacher = currentUserService.IsInRole("Teacher");
        if (request.TeacherId.HasValue && !isAdmin)
            throw new ForbiddenAccessException("Only administrators can filter assignments by teacher.");

        var (items, totalCount) = await repository.GetPagedAsync(
            request, userId, isAdmin, isTeacher, cancellationToken);
        return new PagedResponse<AssignmentListItemResponse>(
            mapper.Map<IReadOnlyCollection<AssignmentListItemResponse>>(items),
            request.PageNumber, request.PageSize, totalCount);
    }

    public async Task<AssignmentDetailResponse> GetByIdAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        var userId = RequireUser();
        var item = await repository.GetDetailAsync(
            id, userId, currentUserService.IsInRole("Admin"),
            currentUserService.IsInRole("Teacher"), cancellationToken)
            ?? throw new NotFoundException(nameof(DomainAssignment), id);
        return mapper.Map<AssignmentDetailResponse>(item);
    }

    public async Task<AssignmentDetailResponse> CreateAsync(
        CreateAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var teacherId = RequireTeacher();
        if (!await repository.ActiveTeachingAssignmentBelongsToTeacherAsync(
                request.TeachingAssignmentId, teacherId, cancellationToken))
            throw new ForbiddenAccessException(
                "The teaching assignment is inactive or does not belong to the current teacher.");

        var now = dateTimeProvider.UtcNow;
        var assignment = new DomainAssignment(
            request.TeachingAssignmentId, request.Title, request.Description,
            request.DeadlineUtc, request.MaximumMarks, request.AllowResubmission)
        {
            CreatedAtUtc = now,
            CreatedBy = teacherId
        };
        if (request.PublishNow)
            assignment.Publish(now);

        await repository.AddAsync(assignment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(assignment.Id, cancellationToken);
    }

    public async Task<AssignmentMutationResponse> UpdateAsync(
        Guid id, UpdateAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var assignment = await GetOwnedAssignmentAsync(id, cancellationToken);
        repository.SetOriginalVersion(assignment, DecodeVersion(request.RowVersion));
        assignment.UpdateDetails(request.Title, request.Description, request.DeadlineUtc,
            request.MaximumMarks, request.AllowResubmission);
        SetUpdatedAudit(assignment);
        repository.Update(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(assignment);
    }

    public async Task<AssignmentMutationResponse> PublishAsync(
        Guid id, PublishAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var assignment = await GetOwnedAssignmentAsync(id, cancellationToken);
        repository.SetOriginalVersion(assignment, DecodeVersion(request.RowVersion));
        assignment.Publish(dateTimeProvider.UtcNow);
        SetUpdatedAudit(assignment);
        repository.Update(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(assignment);
    }

    public async Task<AssignmentMutationResponse> CloseAsync(
        Guid id, CloseAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var assignment = await GetOwnedAssignmentAsync(id, cancellationToken);
        repository.SetOriginalVersion(assignment, DecodeVersion(request.RowVersion));
        assignment.Close();
        SetUpdatedAudit(assignment);
        repository.Update(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(assignment);
    }

    public async Task DeleteAsync(
        Guid id, string rowVersion, CancellationToken cancellationToken = default)
    {
        var assignment = await GetOwnedAssignmentAsync(id, cancellationToken);
        repository.SetOriginalVersion(assignment, DecodeVersion(rowVersion));
        repository.Remove(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<DomainAssignment> GetOwnedAssignmentAsync(
        Guid id, CancellationToken cancellationToken)
    {
        var teacherId = RequireTeacher();
        if (!await repository.IsOwnedByTeacherAsync(id, teacherId, cancellationToken))
            throw new ForbiddenAccessException();
        return await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(DomainAssignment), id);
    }

    private Guid RequireUser() => currentUserService.UserId
        ?? throw new ForbiddenAccessException("An authenticated user is required.");

    private Guid RequireTeacher()
    {
        var userId = RequireUser();
        if (!currentUserService.IsInRole("Teacher"))
            throw new ForbiddenAccessException("A teacher account is required.");
        return userId;
    }

    private void SetUpdatedAudit(DomainAssignment assignment)
    {
        assignment.UpdatedAtUtc = dateTimeProvider.UtcNow;
        assignment.UpdatedBy = currentUserService.UserId;
    }

    private static uint DecodeVersion(string rowVersion)
    {
        try
        {
            var bytes = Convert.FromBase64String(rowVersion);
            if (bytes.Length != sizeof(uint)) throw new FormatException();
            return BitConverter.ToUInt32(bytes);
        }
        catch (FormatException)
        {
            throw new ValidationException("RowVersion must be a valid concurrency token.");
        }
    }

    private static AssignmentMutationResponse ToMutationResponse(DomainAssignment assignment) =>
        new(assignment.Id, assignment.Status, assignment.PublishedAtUtc,
            assignment.UpdatedAtUtc, Convert.ToBase64String(BitConverter.GetBytes(assignment.Version)));
}
