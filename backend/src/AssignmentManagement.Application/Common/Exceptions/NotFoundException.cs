namespace AssignmentManagement.Application.Common.Exceptions;

public sealed class NotFoundException(string entityName, object key)
    : Exception($"Entity '{entityName}' with key '{key}' was not found.");
