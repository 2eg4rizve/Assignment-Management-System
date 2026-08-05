using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Subjects;
using AssignmentManagement.Application.Dtos.ResponseDtos.Subjects;
using AssignmentManagement.Domain.Entities;
using AutoMapper;

namespace AssignmentManagement.Application.Services;

public sealed class SubjectService(
    ISubjectRepository subjectRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IDateTimeProvider dateTimeProvider,
    ICurrentUserService currentUserService) : ISubjectService
{
    public async Task<PagedResponse<SubjectResponse>> GetPagedAsync(
        SubjectQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await subjectRepository.GetPagedAsync(
            request,
            cancellationToken);

        var responses = mapper.Map<IReadOnlyCollection<SubjectResponse>>(items);

        return new PagedResponse<SubjectResponse>(
            responses,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public async Task<SubjectResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var subject = await subjectRepository.GetReadModelByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Subject), id);

        return mapper.Map<SubjectResponse>(subject);
    }

    public async Task<SubjectResponse> CreateAsync(
        CreateSubjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        if (await subjectRepository.CodeExistsAsync(
                normalizedCode,
                excludingSubjectId: null,
                cancellationToken))
        {
            throw new ConflictException($"Subject code '{normalizedCode}' already exists.");
        }

        var subject = new Subject(normalizedCode, request.Name, request.Description)
        {
            CreatedAtUtc = dateTimeProvider.UtcNow,
            CreatedBy = currentUserService.UserId
        };

        await subjectRepository.AddAsync(subject, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var createdSubject = await subjectRepository.GetReadModelByIdAsync(
            subject.Id,
            cancellationToken);

        return mapper.Map<SubjectResponse>(createdSubject!);
    }

    public async Task<SubjectResponse> UpdateAsync(
        Guid id,
        UpdateSubjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var subject = await subjectRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Subject), id);

        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        if (await subjectRepository.CodeExistsAsync(
                normalizedCode,
                excludingSubjectId: id,
                cancellationToken))
        {
            throw new ConflictException($"Subject code '{normalizedCode}' already exists.");
        }

        subject.Update(normalizedCode, request.Name, request.Description);

        if (request.IsActive)
        {
            subject.Activate();
        }
        else
        {
            subject.Deactivate();
        }

        subject.UpdatedAtUtc = dateTimeProvider.UtcNow;
        subject.UpdatedBy = currentUserService.UserId;

        subjectRepository.Update(subject);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedSubject = await subjectRepository.GetReadModelByIdAsync(
            id,
            cancellationToken);

        return mapper.Map<SubjectResponse>(updatedSubject!);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var subject = await subjectRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Subject), id);

        subjectRepository.Remove(subject);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
