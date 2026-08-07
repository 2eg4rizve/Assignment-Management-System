using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Enrollments;
using AssignmentManagement.Application.Dtos.ResponseDtos.Enrollments;
using AssignmentManagement.Domain.Entities;
using AutoMapper;

namespace AssignmentManagement.Application.Services;

public sealed class CourseEnrollmentService(
    ICourseEnrollmentRepository repository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService) : ICourseEnrollmentService
{
    public async Task<PagedResponse<EnrollmentResponse>> GetPagedAsync(
        EnrollmentQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await repository.GetPagedAsync(request, cancellationToken);
        var responses = mapper.Map<IReadOnlyCollection<EnrollmentResponse>>(items);
        return new PagedResponse<EnrollmentResponse>(
            responses, request.PageNumber, request.PageSize, totalCount);
    }

    public async Task<EnrollmentResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var item = await repository.GetReadModelByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(CourseEnrollment), id);
        return mapper.Map<EnrollmentResponse>(item);
    }

    public async Task<EnrollmentResponse> CreateAsync(
        CreateEnrollmentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await repository.StudentExistsAsync(request.StudentId, cancellationToken))
            throw new NotFoundException("Student", request.StudentId);
        if (!await repository.ActiveCourseExistsAsync(request.CourseId, cancellationToken))
            throw new NotFoundException(nameof(Course), request.CourseId);
        if (await repository.ExistsAsync(request.StudentId, request.CourseId, cancellationToken))
            throw new ConflictException("This student is already enrolled in the selected course.");

        var item = new CourseEnrollment(request.StudentId, request.CourseId, dateTimeProvider.UtcNow)
        {
            CreatedAtUtc = dateTimeProvider.UtcNow,
            CreatedBy = currentUserService.UserId
        };

        await repository.AddAsync(item, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(item.Id, cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(CourseEnrollment), id);

        item.Deactivate();
        item.UpdatedAtUtc = dateTimeProvider.UtcNow;
        item.UpdatedBy = currentUserService.UserId;
        repository.Update(item);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
