using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Users;
using AssignmentManagement.Application.Dtos.ResponseDtos.Users;

namespace AssignmentManagement.Application.Common.Interfaces.Services;

public interface IUserService
{
    Task<PagedResponse<UserListItemResponse>> GetPagedAsync(
        UserQueryRequest request,
        CancellationToken cancellationToken = default);

    Task<UserDetailResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<UserDetailResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default);

    Task<UserDetailResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(
        Guid id,
        AdminResetPasswordRequest request,
        CancellationToken cancellationToken = default);
}
