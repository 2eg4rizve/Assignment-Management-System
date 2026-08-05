namespace AssignmentManagement.Api.Authorization;

public static class AuthorizationPolicies
{
    public const string RequireAdmin = nameof(RequireAdmin);
    public const string RequireTeacher = nameof(RequireTeacher);
    public const string RequireStudent = nameof(RequireStudent);
}
