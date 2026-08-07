using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Application.Dtos.ResponseDtos.Submissions;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AutoMapper;

namespace AssignmentManagement.Application.Services;

public sealed class SubmissionService(ISubmissionRepository repository, IUnitOfWork unitOfWork,
    IMapper mapper, IDateTimeProvider dateTimeProvider, ICurrentUserService currentUserService)
    : ISubmissionService
{
    public async Task<PagedResponse<SubmissionListItemResponse>> GetPagedAsync(SubmissionQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = RequireUser();
        var isAdmin = currentUserService.IsInRole("Admin");
        var isTeacher = currentUserService.IsInRole("Teacher");
        if (request.StudentId.HasValue && !isAdmin && !isTeacher && request.StudentId != userId)
            throw new ForbiddenAccessException("Students can only view their own submissions.");
        var (items, totalCount) = await repository.GetPagedAsync(request, userId, isAdmin, isTeacher, cancellationToken);
        return new PagedResponse<SubmissionListItemResponse>(
            mapper.Map<IReadOnlyCollection<SubmissionListItemResponse>>(items),
            request.PageNumber, request.PageSize, totalCount);
    }

    public async Task<SubmissionDetailResponse> GetByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        var userId = RequireUser();
        var item = await repository.GetDetailAsync(id, userId, currentUserService.IsInRole("Admin"),
            currentUserService.IsInRole("Teacher"), cancellationToken)
            ?? throw new NotFoundException(nameof(Submission), id);
        return mapper.Map<SubmissionDetailResponse>(item);
    }

    public async Task<SubmissionDetailResponse> CreateAsync(Guid assignmentId, CreateSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        var studentId = RequireStudent();
        if (!await repository.CanStudentSubmitAsync(assignmentId, studentId, cancellationToken))
            throw new ForbiddenAccessException("The assignment is unavailable or the student is not actively enrolled.");
        if (await repository.GetByAssignmentAndStudentAsync(assignmentId, studentId, cancellationToken) is not null)
            throw new ConflictException("A submission already exists for this assignment. Update it instead.");
        var now = dateTimeProvider.UtcNow;
        var submission = new Submission(assignmentId, studentId, request.AnswerText, now)
        { CreatedAtUtc = now, CreatedBy = studentId };
        await repository.AddAsync(submission, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(submission.Id, cancellationToken);
    }

    public async Task<SubmissionMutationResponse> UpdateAsync(Guid id, UpdateSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        var studentId = RequireStudent();
        if (!await repository.IsOwnedByStudentAsync(id, studentId, cancellationToken))
            throw new ForbiddenAccessException();
        var submission = await GetEntityAsync(id, cancellationToken);
        if (!await repository.CanStudentResubmitAsync(submission.AssignmentId, studentId, cancellationToken))
            throw new ForbiddenAccessException("The assignment does not allow another submission.");
        repository.SetOriginalVersion(submission, DecodeVersion(request.RowVersion));
        submission.UpdateAnswer(request.AnswerText, dateTimeProvider.UtcNow);
        SetUpdatedAudit(submission);
        repository.Update(submission);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(submission);
    }

    public async Task<SubmissionMutationResponse> UpdateStatusAsync(Guid id,
        UpdateSubmissionStatusRequest request, CancellationToken cancellationToken = default)
    {
        var submission = await GetTeacherOwnedAsync(id, cancellationToken);
        repository.SetOriginalVersion(submission, DecodeVersion(request.RowVersion));
        if (request.Status == SubmissionStatus.UnderReview) submission.MarkUnderReview();
        else if (request.Status == SubmissionStatus.Returned) submission.ReturnForRevision();
        else throw new ValidationException("Status must be UnderReview or Returned.");
        SetUpdatedAudit(submission);
        repository.Update(submission);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(submission);
    }

    public async Task<SubmissionMutationResponse> GradeAsync(Guid id, GradeSubmissionRequest request,
        CancellationToken cancellationToken = default)
    {
        var teacherId = RequireTeacher();
        if (!await repository.IsOwnedByTeacherAsync(id, teacherId, cancellationToken))
            throw new ForbiddenAccessException();
        var submission = await GetEntityAsync(id, cancellationToken);
        var detail = await repository.GetDetailAsync(id, teacherId, false, true, cancellationToken)
            ?? throw new NotFoundException(nameof(Submission), id);
        repository.SetOriginalVersion(submission, DecodeVersion(request.RowVersion));
        submission.Grade(request.MarksAwarded, detail.MaximumMarks, request.Feedback, teacherId,
            dateTimeProvider.UtcNow, request.PublishGrade);
        SetUpdatedAudit(submission);
        repository.Update(submission);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToMutationResponse(submission);
    }

    private async Task<Submission> GetTeacherOwnedAsync(Guid id, CancellationToken cancellationToken)
    {
        var teacherId = RequireTeacher();
        if (!await repository.IsOwnedByTeacherAsync(id, teacherId, cancellationToken))
            throw new ForbiddenAccessException();
        return await GetEntityAsync(id, cancellationToken);
    }

    private async Task<Submission> GetEntityAsync(Guid id, CancellationToken cancellationToken) =>
        await repository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException(nameof(Submission), id);
    private Guid RequireUser() => currentUserService.UserId ?? throw new ForbiddenAccessException("An authenticated user is required.");
    private Guid RequireStudent()
    {
        var id = RequireUser();
        if (!currentUserService.IsInRole("Student")) throw new ForbiddenAccessException("A student account is required.");
        return id;
    }
    private Guid RequireTeacher()
    {
        var id = RequireUser();
        if (!currentUserService.IsInRole("Teacher")) throw new ForbiddenAccessException("A teacher account is required.");
        return id;
    }
    private void SetUpdatedAudit(Submission item)
    {
        item.UpdatedAtUtc = dateTimeProvider.UtcNow;
        item.UpdatedBy = currentUserService.UserId;
    }
    private static uint DecodeVersion(string rowVersion)
    {
        try
        {
            var bytes = Convert.FromBase64String(rowVersion);
            if (bytes.Length != sizeof(uint)) throw new FormatException();
            return BitConverter.ToUInt32(bytes);
        }
        catch (FormatException) { throw new ValidationException("RowVersion must be a valid concurrency token."); }
    }
    private static SubmissionMutationResponse ToMutationResponse(Submission item) =>
        new(item.Id, item.Status, item.LastSubmittedAtUtc, item.MarksAwarded, item.GradedAtUtc,
            Convert.ToBase64String(BitConverter.GetBytes(item.Version)));
}
