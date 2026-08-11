using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AssignmentManagement.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    private static readonly string[] Roles = ["Admin", "Teacher", "Student"];

    public static async Task InitializeDatabaseAsync(this IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var provider = scope.ServiceProvider;
        var dbContext = provider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);

        var roleManager = provider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var roleName in Roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
                EnsureSucceeded(await roleManager.CreateAsync(new IdentityRole<Guid>(roleName)));
        }

        var options = provider.GetRequiredService<IOptions<DemoSeedOptions>>().Value;
        if (!options.Enabled) return;
        if (string.IsNullOrWhiteSpace(options.Password))
            throw new InvalidOperationException("DemoSeed:Password is required when demo seeding is enabled.");

        var userManager = provider.GetRequiredService<UserManager<ApplicationUser>>();
        var admin = await EnsureUserAsync(userManager, "admin@assignment.local", "Demo", "Admin",
            "Admin", options.Password);
        var teacher = await EnsureUserAsync(userManager, "teacher@assignment.local", "Demo", "Teacher",
            "Teacher", options.Password, teacherCode: "T-DEMO-26-001");
        var student = await EnsureUserAsync(userManager, "student@assignment.local", "Demo", "Student",
            "Student", options.Password, "DEMO-26-01-001");
        await SeedAcademicDataAsync(dbContext, admin.Id, teacher.Id, student.Id, cancellationToken);
    }

    private static async Task<ApplicationUser> EnsureUserAsync(UserManager<ApplicationUser> userManager,
        string email, string firstName, string lastName, string role, string password,
        string? studentCode = null, string? teacherCode = null)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = firstName,
                LastName = lastName,
                StudentCode = studentCode,
                TeacherCode = teacherCode,
                IsActive = true,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            EnsureSucceeded(await userManager.CreateAsync(user, password));
        }

        if (studentCode is not null && user.StudentCode != studentCode)
        {
            user.StudentCode = studentCode;
            EnsureSucceeded(await userManager.UpdateAsync(user));
        }

        if (teacherCode is not null && user.TeacherCode != teacherCode)
        {
            user.TeacherCode = teacherCode;
            EnsureSucceeded(await userManager.UpdateAsync(user));
        }

        if (!await userManager.IsInRoleAsync(user, role))
            EnsureSucceeded(await userManager.AddToRoleAsync(user, role));
        return user;
    }

    private static async Task SeedAcademicDataAsync(ApplicationDbContext dbContext, Guid adminId,
        Guid teacherId, Guid studentId, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var course = await dbContext.Courses.SingleOrDefaultAsync(item => item.Code == "DEMO-101", cancellationToken);
        if (course is null)
        {
            course = new Course("DEMO-101", "Demo Course", "Development demonstration course", "2026", "A")
            { CreatedAtUtc = now, CreatedBy = adminId };
            dbContext.Courses.Add(course);
        }

        var mathematics = await EnsureSubjectAsync(dbContext, "MATH-DEMO", "Mathematics", adminId, now,
            cancellationToken);
        await EnsureSubjectAsync(dbContext, "SCI-DEMO", "Science", adminId, now, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var teaching = await dbContext.TeachingAssignments.SingleOrDefaultAsync(item =>
            item.TeacherId == teacherId && item.CourseId == course.Id && item.SubjectId == mathematics.Id,
            cancellationToken);
        if (teaching is null)
        {
            teaching = new TeachingAssignment(teacherId, course.Id, mathematics.Id)
            { CreatedAtUtc = now, CreatedBy = adminId };
            dbContext.TeachingAssignments.Add(teaching);
        }

        if (!await dbContext.CourseEnrollments.AnyAsync(item =>
                item.StudentId == studentId && item.CourseId == course.Id, cancellationToken))
            dbContext.CourseEnrollments.Add(new CourseEnrollment(studentId, course.Id, now)
            { CreatedAtUtc = now, CreatedBy = adminId });
        await dbContext.SaveChangesAsync(cancellationToken);

        if (!await dbContext.Assignments.AnyAsync(item => item.TeachingAssignmentId == teaching.Id,
                cancellationToken))
        {
            var draft = new AssignmentManagement.Domain.Entities.Assignment(teaching.Id, "Demo Draft Assignment",
                "A draft assignment for development testing.", now.AddDays(14), 100, true)
            { CreatedAtUtc = now, CreatedBy = teacherId };
            var published = new AssignmentManagement.Domain.Entities.Assignment(teaching.Id, "Demo Published Assignment",
                "A published assignment for development testing.", now.AddDays(7), 100, true)
            { CreatedAtUtc = now, CreatedBy = teacherId };
            published.Publish(now);
            dbContext.Assignments.AddRange(draft, published);
            await dbContext.SaveChangesAsync(cancellationToken);

            dbContext.Submissions.Add(new Submission(published.Id, studentId,
                "This is a representative demo submission.", now)
            { CreatedAtUtc = now, CreatedBy = studentId });
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task<Subject> EnsureSubjectAsync(ApplicationDbContext dbContext,
        string code, string name, Guid adminId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var subject = await dbContext.Subjects.SingleOrDefaultAsync(item => item.Code == code, cancellationToken);
        if (subject is not null) return subject;
        subject = new Subject(code, name, "Development demonstration subject")
        { CreatedAtUtc = now, CreatedBy = adminId };
        dbContext.Subjects.Add(subject);
        return subject;
    }

    private static void EnsureSucceeded(IdentityResult result)
    {
        if (result.Succeeded) return;
        throw new InvalidOperationException(string.Join("; ", result.Errors.Select(error => error.Description)));
    }
}
