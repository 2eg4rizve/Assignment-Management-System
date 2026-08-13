using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Domain.Exceptions;

namespace AssignmentManagement.UnitTests.Domain;

public sealed class SubmissionTests
{
    [Fact]
    public void Constructor_ShouldCreateSubmittedAnswerWithNormalizedText()
    {
        var submittedAtUtc = DateTimeOffset.Parse("2026-08-13T10:00:00Z");

        var submission = CreateSubmission("  My answer  ", submittedAtUtc);

        Assert.Equal("My answer", submission.AnswerText);
        Assert.Equal(SubmissionStatus.Submitted, submission.Status);
        Assert.Equal(submittedAtUtc, submission.SubmittedAtUtc);
        Assert.Equal(submittedAtUtc, submission.LastSubmittedAtUtc);
    }

    [Fact]
    public void UpdateAnswer_ShouldNormalizeTextAndReturnSubmissionToSubmitted()
    {
        var submission = CreateSubmission();
        submission.MarkUnderReview();
        submission.ReturnForRevision();
        var resubmittedAtUtc = DateTimeOffset.Parse("2026-08-13T11:00:00Z");

        submission.UpdateAnswer("  Revised answer  ", resubmittedAtUtc);

        Assert.Equal("Revised answer", submission.AnswerText);
        Assert.Equal(SubmissionStatus.Submitted, submission.Status);
        Assert.Equal(resubmittedAtUtc, submission.LastSubmittedAtUtc);
    }

    [Fact]
    public void UpdateAnswer_WhenGraded_ShouldFail()
    {
        var submission = CreateSubmission();
        submission.Grade(80, 100, "Good work", Guid.NewGuid(),
            DateTimeOffset.Parse("2026-08-13T11:00:00Z"), true);

        var exception = Assert.Throws<DomainException>(() =>
            submission.UpdateAnswer("Another answer", DateTimeOffset.Parse("2026-08-13T12:00:00Z")));

        Assert.Equal("A graded submission cannot be edited.", exception.Message);
    }

    [Fact]
    public void MarkUnderReview_ShouldRequireSubmittedStatus()
    {
        var submission = CreateSubmission();
        submission.MarkUnderReview();

        var exception = Assert.Throws<DomainException>(submission.MarkUnderReview);

        Assert.Equal("Only a submitted answer can be placed under review.", exception.Message);
    }

    [Fact]
    public void ReturnForRevision_ShouldAllowSubmittedAndUnderReviewStatuses()
    {
        var submitted = CreateSubmission();
        var underReview = CreateSubmission();
        underReview.MarkUnderReview();

        submitted.ReturnForRevision();
        underReview.ReturnForRevision();

        Assert.Equal(SubmissionStatus.Returned, submitted.Status);
        Assert.Equal(SubmissionStatus.Returned, underReview.Status);
    }

    [Fact]
    public void Grade_WithPublishedGrade_ShouldStoreMarksFeedbackAndGrader()
    {
        var submission = CreateSubmission();
        var teacherId = Guid.NewGuid();
        var gradedAtUtc = DateTimeOffset.Parse("2026-08-13T11:00:00Z");

        submission.Grade(87.5m, 100, "  Strong solution  ", teacherId, gradedAtUtc, true);

        Assert.Equal(SubmissionStatus.Graded, submission.Status);
        Assert.Equal(87.5m, submission.MarksAwarded);
        Assert.Equal("Strong solution", submission.Feedback);
        Assert.Equal(teacherId, submission.GradedBy);
        Assert.Equal(gradedAtUtc, submission.GradedAtUtc);
    }

    [Fact]
    public void Grade_WithoutPublishing_ShouldRemainUnderReview()
    {
        var submission = CreateSubmission();

        submission.Grade(75, 100, null, Guid.NewGuid(),
            DateTimeOffset.Parse("2026-08-13T11:00:00Z"), false);

        Assert.Equal(SubmissionStatus.UnderReview, submission.Status);
        Assert.Equal(75, submission.MarksAwarded);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void Grade_WithMarksOutsideAssignmentRange_ShouldFail(decimal marks)
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<DomainException>(() =>
            submission.Grade(marks, 100, null, Guid.NewGuid(),
                DateTimeOffset.Parse("2026-08-13T11:00:00Z"), true));

        Assert.Equal("Marks must be between zero and 100.", exception.Message);
    }

    private static Submission CreateSubmission(
        string answer = "Initial answer",
        DateTimeOffset? submittedAtUtc = null) =>
        new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            answer,
            submittedAtUtc ?? DateTimeOffset.Parse("2026-08-13T10:00:00Z"));
}
