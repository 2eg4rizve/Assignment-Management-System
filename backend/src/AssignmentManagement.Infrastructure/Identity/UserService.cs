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
        if (!string.IsNullOrWhiteSpace(request.StudentCode))
        {
            var pattern = $"{request.StudentCode.Trim()}%";
            query = query.Where(user => user.StudentCode != null &&
                EF.Functions.ILike(user.StudentCode, pattern));
        }
        if (!string.IsNullOrWhiteSpace(request.TeacherCode))
        {
            var pattern = $"{request.TeacherCode.Trim()}%";
            query = query.Where(user => user.TeacherCode != null &&
                EF.Functions.ILike(user.TeacherCode, pattern));
        }
        if (request.CreatedFromUtc.HasValue)
            query = query.Where(user => user.CreatedAtUtc >= request.CreatedFromUtc.Value);
        if (request.CreatedToUtc.HasValue)
            query = query.Where(user => user.CreatedAtUtc <= request.CreatedToUtc.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(user =>
                EF.Functions.ILike(user.FirstName, pattern) ||
                EF.Functions.ILike(user.LastName, pattern) ||
                EF.Functions.ILike(user.Email!, pattern) ||
                (user.StudentCode != null && EF.Functions.ILike(user.StudentCode, pattern)) ||
                (user.TeacherCode != null && EF.Functions.ILike(user.TeacherCode, pattern)));
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
                user.StudentCode,
                user.TeacherCode,
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
        var generatedCode = await GenerateInstitutionCodeAsync(request, cancellationToken);
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            UserName = email,
            StudentCode = request.Role == UserRole.Student ? generatedCode : null,
            TeacherCode = request.Role == UserRole.Teacher ? generatedCode : null,
            IsActive = true,
            CreatedAtUtc = dateTimeProvider.UtcNow
        };
        EnsureIdentitySucceeded(await userManager.CreateAsync(user, request.Password));
        EnsureIdentitySucceeded(await userManager.AddToRoleAsync(user, request.Role.ToString()));
        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(user.Id, cancellationToken);
    }

    private async Task<string?> GenerateInstitutionCodeAsync(
        CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (request.Role == UserRole.Admin) return null;
        if (string.IsNullOrWhiteSpace(request.CodeYear) ||
            string.IsNullOrWhiteSpace(request.CodeSemester))
            throw new ValidationException("Year and semester are required to generate the ID.");

        string prefix;
        if (request.Role == UserRole.Student)
        {
            if (!request.StudentCourseId.HasValue)
                throw new ValidationException("Course is required to generate a student ID.");
            var courseCode = await dbContext.Courses
                .Where(course => course.Id == request.StudentCourseId.Value && course.IsActive)
                .Select(course => course.Code)
                .SingleOrDefaultAsync(cancellationToken)
                ?? throw new ValidationException("Select an active course for the student ID.");
            prefix = new string(courseCode.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
            if (string.IsNullOrEmpty(prefix))
                throw new ValidationException("The selected course does not have a usable code.");
        }
        else
        {
            prefix = "T";
        }

        var stem = $"{prefix}{request.CodeYear}{request.CodeSemester}";
        if (stem.Length + 2 > 30)
            throw new ValidationException("The generated ID exceeds the maximum length.");
        if (dbContext.Database.IsNpgsql())
            await dbContext.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtext({stem}))", cancellationToken);

        var existingCodes = request.Role == UserRole.Student
            ? await dbContext.Users.Where(user => user.StudentCode != null &&
                    user.StudentCode.StartsWith(stem))
                .Select(user => user.StudentCode!).ToListAsync(cancellationToken)
            : await dbContext.Users.Where(user => user.TeacherCode != null &&
                    user.TeacherCode.StartsWith(stem))
                .Select(user => user.TeacherCode!).ToListAsync(cancellationToken);
        var lastSerial = existingCodes
            .Select(code => int.TryParse(code[stem.Length..], out var serial) ? serial : 0)
            .DefaultIfEmpty(0)
            .Max();
        if (lastSerial >= 99)
            throw new ValidationException("No serial numbers remain for this ID group.");
        return $"{stem}{lastSerial + 1:00}";
    }

    public async Task<UserDetailResponse> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureValidRole(request.Role);
        var studentCode = NormalizeStudentCode(request.StudentCode, request.Role);
        var teacherCode = NormalizeTeacherCode(request.TeacherCode, request.Role);
        var user = await userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException(nameof(ApplicationUser), id);
        var email = request.Email.Trim();
        var userWithEmail = await userManager.FindByEmailAsync(email);
        if (userWithEmail is not null && userWithEmail.Id != id)
            throw new ConflictException("A user with this email address already exists.");
        if (studentCode is not null && await dbContext.Users.AnyAsync(
                value => value.StudentCode == studentCode && value.Id != id, cancellationToken))
            throw new ConflictException("A user with this student ID already exists.");
        if (teacherCode is not null && await dbContext.Users.AnyAsync(
                value => value.TeacherCode == teacherCode && value.Id != id, cancellationToken))
            throw new ConflictException("A user with this teacher ID already exists.");

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = email;
        user.UserName = email;
        user.StudentCode = studentCode;
        user.TeacherCode = teacherCode;
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
            user.StudentCode,
            user.TeacherCode,
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

    private static string? NormalizeStudentCode(string? value, UserRole role)
    {
        if (role != UserRole.Student) return null;
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException("Student ID is required for students.");
        return value.Trim().ToUpperInvariant();
    }

    private static string? NormalizeTeacherCode(string? value, UserRole role)
    {
        if (role != UserRole.Teacher) return null;
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException("Teacher ID is required for teachers.");
        return value.Trim().ToUpperInvariant();
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
