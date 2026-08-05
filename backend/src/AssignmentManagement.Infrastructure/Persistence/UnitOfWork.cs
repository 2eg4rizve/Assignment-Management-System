using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AssignmentManagement.Infrastructure.Persistence;

public sealed class UnitOfWork(ApplicationDbContext dbContext) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new DataConcurrencyException(
                "The record was changed by another request. Reload it and try again.");
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation
            })
        {
            throw new ConflictException(
                "A record with the same unique value already exists.");
        }
    }
}
