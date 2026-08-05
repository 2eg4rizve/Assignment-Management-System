using AssignmentManagement.Api.Authorization;
using AssignmentManagement.Api.Middleware;
using AssignmentManagement.Api.Services;
using AssignmentManagement.Application;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Infrastructure;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddAuthentication();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AuthorizationPolicies.RequireAdmin,
        policy => policy.RequireRole(ApplicationRoles.Admin))
    .AddPolicy(AuthorizationPolicies.RequireTeacher,
        policy => policy.RequireRole(ApplicationRoles.Teacher))
    .AddPolicy(AuthorizationPolicies.RequireStudent,
        policy => policy.RequireRole(ApplicationRoles.Student));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

public partial class Program;
