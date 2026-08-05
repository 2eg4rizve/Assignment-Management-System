namespace AssignmentManagement.Api.Authorization;

public static class ApplicationRoles
{
    public const string Admin = nameof(Admin);
    public const string Teacher = nameof(Teacher);
    public const string Student = nameof(Student);

    public static readonly string[] All = [Admin, Teacher, Student];
}
