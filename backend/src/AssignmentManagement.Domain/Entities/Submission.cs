using AssignmentManagement.Domain.Common;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Domain.Exceptions;

namespace AssignmentManagement.Domain.Entities;

public sealed class Submission : BaseEntity
{
    private Submission()
    {
    }

    public Submission(
        Guid assignmentId,
        Guid studentId,
        string answerText,
        DateTimeOffset submittedAtUtc)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(assignmentId, Guid.Empty);
        ArgumentOutOfRangeException.ThrowIfEqual(studentId, Guid.Empty);
        ArgumentException.ThrowIfNullOrWhiteSpace(answerText);

        AssignmentId = assignmentId;
        StudentId = studentId;
        AnswerText = answerText.Trim();
        Status = SubmissionStatus.Submitted;
        SubmittedAtUtc = submittedAtUtc;
        LastSubmittedAtUtc = submittedAtUtc;
    }

    public Guid AssignmentId { get; private set; }

    public Assignment Assignment { get; private set; } = null!;

    public Guid StudentId { get; private set; }

    public string AnswerText { get; private set; } = string.Empty;

    public SubmissionStatus Status { get; private set; }

    public DateTimeOffset SubmittedAtUtc { get; private set; }

    public DateTimeOffset LastSubmittedAtUtc { get; private set; }

    public decimal? MarksAwarded { get; private set; }

    public string? Feedback { get; private set; }

    public DateTimeOffset? GradedAtUtc { get; private set; }

    public Guid? GradedBy { get; private set; }

    public uint Version { get; private set; }

    public void UpdateAnswer(string answerText, DateTimeOffset submittedAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(answerText);

        if (Status == SubmissionStatus.Graded)
        {
            throw new DomainException("A graded submission cannot be edited.");
        }

        AnswerText = answerText.Trim();
        Status = SubmissionStatus.Submitted;
        LastSubmittedAtUtc = submittedAtUtc;
    }

    public void MarkUnderReview()
    {
        if (Status != SubmissionStatus.Submitted)
        {
            throw new DomainException("Only a submitted answer can be placed under review.");
        }

        Status = SubmissionStatus.UnderReview;
    }

    public void ReturnForRevision()
    {
        if (Status is not (SubmissionStatus.Submitted or SubmissionStatus.UnderReview))
        {
            throw new DomainException("This submission cannot be returned for revision.");
        }

        Status = SubmissionStatus.Returned;
    }

    public void Grade(
        decimal marksAwarded,
        decimal maximumMarks,
        string? feedback,
        Guid gradedBy,
        DateTimeOffset gradedAtUtc,
        bool publishGrade)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(gradedBy, Guid.Empty);

        if (marksAwarded < 0 || marksAwarded > maximumMarks)
        {
            throw new DomainException(
                $"Marks must be between zero and {maximumMarks}.");
        }

        MarksAwarded = marksAwarded;
        Feedback = feedback?.Trim();
        GradedBy = gradedBy;
        GradedAtUtc = gradedAtUtc;
        Status = publishGrade
            ? SubmissionStatus.Graded
            : SubmissionStatus.UnderReview;
    }
}
