using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Application.Common.Exceptions;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Application.Common.Models;
using AssignmentManagement.Application.Dtos.RequestDtos.Users;
using AssignmentManagement.Application.Dtos.ResponseDtos.Users;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Identity;

public sealed class UserService(
    UserManager<ApplicationUser> userManager,
    ApplicationDbContext dbContext,
    IDateTimeProvider dateTimeProvider) : IUserService
{
    public async Task<PagedResponse<UserListItemResponse>> GetPagedAsync(
        UserQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Users.AsNoTracking();
        if (request.Role.HasValue)
        {
            var roleName = request.Role.Value.ToString();
            query = query.Where(user =>
                (from userRole in dbContext.UserRoles
                 join role in dbContext.Roles on userRole.RoleId equals role.Id
                 where userRole.UserId == user.Id && role.Name == roleName
                 select userRole).Any());
        }
        if (request.IsActive.HasValue)
            query = query.Where(user => user.IsActive == request.IsActive.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(user =>
                EF.Functions.ILike(user.FirstName, pattern) ||
                EF.Functions.ILike(user.LastName, pattern) ||
                EF.Functions.ILike(user.Email!, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var users = await query
            .OrderBy(user => user.FirstName)
            .ThenBy(user => user.LastName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<UserListItemResponse>(users.Count);
        foreach (var user in users)
        {
            var roles = await GetRolesAsync(user);
            items.Add(new UserListItemResponse(
                user.Id,
                FullName(user),
                user.Email ?? string.Empty,
                roles,
                user.IsActive,
                user.CreatedAtUtc));
        }

        return new PagedResponse<UserListItemResponse>(
            items, request.PageNumber, request.PageSize, totalCount);
    }

    public async Task<UserDetailResponse> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.AsNoTracking()
            .SingleOrDefaultAsync(value => value.Id == id, cancellationToken)
            ?? throw new NotFoundException(nameof(ApplicationUser), id);
        return await ToDetailResponseAsync(user);
    }

    public async Task<UserDetailResponse> CreateAsync(
        CreateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureValidRole(request.Role);
        var email = request.Email.Trim();
        if (await userManager.FindByEmailAsync(email) is not null)
            throw new ConflictException("A user with this email address already exists.");

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            UserName = email,
            IsActive = true,
            CreatedAtUtc = dateTimeProvider.UtcNow
        };
        EnsureIdentitySucceeded(await userManager.CreateAsync(user, request.Password));
        EnsureIdentitySucceeded(await userManager.AddToRoleAsync(user, request.Role.ToString()));
        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(user.Id, cancellationToken);
    }

    public async Task<UserDetailResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureValidRole(request.Role);
        var user = await userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), id);
        var email = request.Email.Trim();
        var userWithEmail = await userManager.FindByEmailAsync(email);
        if (userWithEmail is not null && userWithEmail.Id != id)
            throw new ConflictException("A user with this email address already exists.");

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = email;
        user.UserName = email;
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = dateTimeProvider.UtcNow;

        EnsureIdentitySucceeded(await userManager.UpdateAsync(user));
        var currentRoles = await userManager.GetRolesAsync(user);
        var requestedRole = request.Role.ToString();
        if (currentRoles.Count != 1 || !currentRoles.Contains(requestedRole))
        {
            if (currentRoles.Count > 0)
                EnsureIdentitySucceeded(await userManager.RemoveFromRolesAsync(user, currentRoles));
            EnsureIdentitySucceeded(await userManager.AddToRoleAsync(user, requestedRole));
        }

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task ResetPasswordAsync(
        Guid id,
        AdminResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), id);
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        EnsureIdentitySucceeded(await userManager.ResetPasswordAsync(user, token, request.NewPassword));
    }

    private async Task<UserDetailResponse> ToDetailResponseAsync(ApplicationUser user) =>
        new(
            user.Id,
            user.FirstName,
            user.LastName,
            FullName(user),
            user.Email ?? string.Empty,
            await GetRolesAsync(user),
            user.IsActive,
            user.CreatedAtUtc,
            user.UpdatedAtUtc);

    private async Task<IReadOnlyCollection<UserRole>> GetRolesAsync(ApplicationUser user) =>
        (await userManager.GetRolesAsync(user))
            .Select(role => Enum.Parse<UserRole>(role))
            .ToArray();

    private static string FullName(ApplicationUser user) =>
        $"{user.FirstName} {user.LastName}".Trim();

    private static void EnsureValidRole(UserRole role)
    {
        if (!Enum.IsDefined(role))
            throw new ValidationException("Role must be Admin, Teacher, or Student.");
    }

    private static void EnsureIdentitySucceeded(IdentityResult result)
    {
        if (result.Succeeded) return;
        var message = string.Join(" ", result.Errors.Select(error => error.Description));
        if (result.Errors.Any(error => error.Code.Contains("Duplicate", StringComparison.OrdinalIgnoreCase)))
            throw new ConflictException(message);
        throw new ValidationException(message);
    }
}
