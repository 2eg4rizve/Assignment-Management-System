using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Courses;
using AssignmentManagement.Application.Dtos.ResponseDtos.Courses;
using AssignmentManagement.Domain.Entities;
using AutoMapper;

namespace AssignmentManagement.Application.Services;

public sealed class CourseService(
    ICourseRepository courseRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService) : ICourseService
{
    public async Task<PagedResponse<CourseResponse>> GetPagedAsync(
        CourseQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await courseRepository.GetPagedAsync(
            request,
            cancellationToken);

        var responses = mapper.Map<IReadOnlyCollection<CourseResponse>>(items);

        return new PagedResponse<CourseResponse>(
            responses,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public async Task<CourseResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var course = await courseRepository.GetReadModelByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Course), id);

        return mapper.Map<CourseResponse>(course);
    }

    public async Task<CourseResponse> CreateAsync(
        CreateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        if (await courseRepository.CodeExistsAsync(
                normalizedCode,
                excludingCourseId: null,
                cancellationToken))
        {
            throw new ConflictException($"Course code '{normalizedCode}' already exists.");
        }

        var course = new Course(
            normalizedCode,
            request.Name,
            request.Description,
            request.AcademicYear,
            request.Section)
        {
            CreatedAtUtc = dateTimeProvider.UtcNow,
            CreatedBy = currentUserService.UserId
        };

        await courseRepository.AddAsync(course, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var createdCourse = await courseRepository.GetReadModelByIdAsync(
            course.Id,
            cancellationToken);

        return mapper.Map<CourseResponse>(createdCourse!);
    }

    public async Task<CourseResponse> UpdateAsync(
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await courseRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Course), id);

        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        if (await courseRepository.CodeExistsAsync(
                normalizedCode,
                excludingCourseId: id,
                cancellationToken))
        {
            throw new ConflictException($"Course code '{normalizedCode}' already exists.");
        }

        course.Update(
            normalizedCode,
            request.Name,
            request.Description,
            request.AcademicYear,
            request.Section);

        if (request.IsActive)
        {
            course.Activate();
        }
        else
        {
            course.Deactivate();
        }

        course.UpdatedAtUtc = dateTimeProvider.UtcNow;
        course.UpdatedBy = currentUserService.UserId;

        courseRepository.Update(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedCourse = await courseRepository.GetReadModelByIdAsync(id, cancellationToken);
        return mapper.Map<CourseResponse>(updatedCourse!);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var course = await courseRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Course), id);

        courseRepository.Remove(course);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
