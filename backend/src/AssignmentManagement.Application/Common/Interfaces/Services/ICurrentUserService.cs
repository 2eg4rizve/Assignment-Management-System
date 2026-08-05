namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface ICurrentUserService
{
    Guid? UserId { get; }

    bool IsAuthenticated { get; }

    bool IsInRole(string role);
}
