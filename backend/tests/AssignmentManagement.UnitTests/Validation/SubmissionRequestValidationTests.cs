using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Constants;
using AssignmentManagement.Application.Dtos.RequestDtos.Submissions;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.UnitTests.Validation;

public sealed class SubmissionRequestValidationTests
{
    [Fact]
    public void ValidRequests_ShouldPassValidation()
    {
        Assert.Empty(Validate(new CreateSubmissionRequest { AnswerText = "My answer" }));
        Assert.Empty(Validate(new UpdateSubmissionRequest
        {
            AnswerText = "Revised answer",
            RowVersion = "AAAAAA=="
        }));
        Assert.Empty(Validate(new GradeSubmissionRequest
        {
            MarksAwarded = 75,
            Feedback = "Good work",
            RowVersion = "AAAAAA=="
        }));
    }

    [Fact]
    public void EmptyAnswerAndConcurrencyToken_ShouldFailValidation()
    {
        Assert.NotEmpty(Validate(new CreateSubmissionRequest()));
        Assert.NotEmpty(Validate(new UpdateSubmissionRequest()));
    }

    [Fact]
    public void OversizedAnswerAndFeedback_ShouldFailValidation()
    {
        Assert.NotEmpty(Validate(new CreateSubmissionRequest
        {
            AnswerText = new string('a', ValidationConstants.SubmissionAnswerMaxLength + 1)
        }));
        Assert.NotEmpty(Validate(new GradeSubmissionRequest
        {
            Feedback = new string('a', ValidationConstants.FeedbackMaxLength + 1),
            RowVersion = "AAAAAA=="
        }));
    }

    [Theory]
    [InlineData("-0.01")]
    [InlineData("100000")]
    public void MarksOutsideStorageRange_ShouldFailValidation(string marks)
    {
        Assert.NotEmpty(Validate(new GradeSubmissionRequest
        {
            MarksAwarded = decimal.Parse(marks),
            RowVersion = "AAAAAA=="
        }));
    }

    [Fact]
    public void UndefinedStatus_ShouldFailValidation()
    {
        Assert.NotEmpty(Validate(new UpdateSubmissionStatusRequest
        {
            Status = (SubmissionStatus)999,
            RowVersion = "AAAAAA=="
        }));
    }

    private static IReadOnlyCollection<ValidationResult> Validate(object value)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(value, new ValidationContext(value), results, true);
        return results;
    }
}
