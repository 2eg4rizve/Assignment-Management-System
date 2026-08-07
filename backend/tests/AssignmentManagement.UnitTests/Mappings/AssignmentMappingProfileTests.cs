using AssignmentManagement.Application.Assignments.Models;
using AssignmentManagement.Application.Dtos.ResponseDtos.Assignments;
using AssignmentManagement.Application.Mappings;
using AssignmentManagement.Domain.Enums;
using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace AssignmentManagement.UnitTests.Mappings;

public sealed class AssignmentMappingProfileTests
{
    private readonly MapperConfiguration _configuration = new(
        config => config.AddProfile<AssignmentMappingProfile>(),
        NullLoggerFactory.Instance);

    [Fact]
    public void Configuration_ShouldBeValid() => _configuration.AssertConfigurationIsValid();

    [Fact]
    public void DetailMapping_ShouldEncodeVersionAndStudentSubmission()
    {
        var submissionId = Guid.NewGuid();
        var submittedAtUtc = DateTimeOffset.Parse("2026-08-07T10:00:00Z");
        var source = new AssignmentDetailReadModel(
            Guid.NewGuid(), "Task", "Description", Guid.NewGuid(), "CSE-101", "Computer Science",
            "2026", "A", Guid.NewGuid(), "MAT-101", "Mathematics", Guid.NewGuid(),
            "Teacher Name", "teacher@example.com", DateTimeOffset.Parse("2026-08-10T10:00:00Z"),
            100, AssignmentStatus.Published, true, submittedAtUtc, submittedAtUtc, null, 42,
            submissionId, SubmissionStatus.Submitted, submittedAtUtc, submittedAtUtc, null, null);

        var response = _configuration.CreateMapper().Map<AssignmentDetailResponse>(source);

        Assert.Equal(Convert.ToBase64String(BitConverter.GetBytes((uint)42)), response.RowVersion);
        Assert.Equal(submissionId, response.SubmissionSummary?.Id);
    }
}
