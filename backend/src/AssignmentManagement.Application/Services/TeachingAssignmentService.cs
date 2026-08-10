using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.TeachingAssignments;
using AssignmentManagement.Application.Dtos.ResponseDtos.TeachingAssignments;
using AssignmentManagement.Domain.Entities;
using AutoMapper;

namespace AssignmentManagement.Application.Services;

public sealed class TeachingAssignmentService(
    ITeachingAssignmentRepository repository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService) : ITeachingAssignmentService
{
    public async Task<PagedResponse<TeachingAssignmentResponse>> GetPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await repository.GetPagedAsync(request, cancellationToken);
        var responses = mapper.Map<IReadOnlyCollection<TeachingAssignmentResponse>>(items);
        return new PagedResponse<TeachingAssignmentResponse>(
            responses, request.PageNumber, request.PageSize, totalCount);
    }

    public Task<PagedResponse<TeachingAssignmentResponse>> GetCurrentTeacherPagedAsync(
        TeachingAssignmentQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var teacherId = currentUserService.UserId
            ?? throw new ForbiddenAccessException("An authenticated teacher is required.");
        if (!currentUserService.IsInRole("Teacher"))
            throw new ForbiddenAccessException("A teacher account is required.");

        return GetPagedAsync(request with { TeacherId = teacherId }, cancellationToken);
    }

    public async Task<TeachingAssignmentResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var item = await repository.GetReadModelByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(TeachingAssignment), id);
        return mapper.Map<TeachingAssignmentResponse>(item);
    }

    public async Task<TeachingAssignmentResponse> CreateAsync(
        CreateTeachingAssignmentRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateReferencesAsync(request.TeacherId, request.CourseId, request.SubjectId, cancellationToken);
        await EnsureUniqueAsync(request.TeacherId, request.CourseId, request.SubjectId, null, cancellationToken);

        var item = new TeachingAssignment(request.TeacherId, request.CourseId, request.SubjectId)
        {
            CreatedAtUtc = dateTimeProvider.UtcNow,
            CreatedBy = currentUserService.UserId
        };

        await repository.AddAsync(item, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(item.Id, cancellationToken);
    }

    public async Task<TeachingAssignmentResponse> UpdateAsync(
        Guid id,
        UpdateTeachingAssignmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(TeachingAssignment), id);

        await ValidateReferencesAsync(request.TeacherId, request.CourseId, request.SubjectId, cancellationToken);
        await EnsureUniqueAsync(request.TeacherId, request.CourseId, request.SubjectId, id, cancellationToken);

        item.SetAssignment(request.TeacherId, request.CourseId, request.SubjectId);
        if (request.IsActive) item.Activate(); else item.Deactivate();
        item.UpdatedAtUtc = dateTimeProvider.UtcNow;
        item.UpdatedBy = currentUserService.UserId;

        repository.Update(item);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(TeachingAssignment), id);
        repository.Remove(item);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidateReferencesAsync(
        Guid teacherId,
        Guid courseId,
        Guid subjectId,
        CancellationToken cancellationToken)
    {
        if (!await repository.TeacherExistsAsync(teacherId, cancellationToken))
            throw new NotFoundException("Teacher", teacherId);
        if (!await repository.ActiveCourseExistsAsync(courseId, cancellationToken))
            throw new NotFoundException(nameof(Course), courseId);
        if (!await repository.ActiveSubjectExistsAsync(subjectId, cancellationToken))
            throw new NotFoundException(nameof(Subject), subjectId);
    }

    private async Task EnsureUniqueAsync(
        Guid teacherId,
        Guid courseId,
        Guid subjectId,
        Guid? excludingId,
        CancellationToken cancellationToken)
    {
        if (await repository.ExistsAsync(
                teacherId, courseId, subjectId, excludingId, cancellationToken))
        {
            throw new ConflictException(
                "This teacher is already assigned to the selected course and subject.");
        }
    }
}
