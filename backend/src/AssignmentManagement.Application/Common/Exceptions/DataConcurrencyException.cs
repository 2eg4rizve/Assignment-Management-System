namespace AssignmentManagement.Application.Common.Exceptions;

public sealed class DataConcurrencyException(string message) : Exception(message);
