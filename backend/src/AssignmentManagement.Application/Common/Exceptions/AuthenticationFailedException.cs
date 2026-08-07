namespace AssignmentManagement.Application.Common.Exceptions;

public sealed class AuthenticationFailedException(
    string message = "The email address or password is incorrect.") : Exception(message);
