using AssignmentManagement.Application.Common.Interfaces.Repositories;
using AssignmentManagement.Application.Common.Interfaces.Services;
using AssignmentManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Infrastructure.Persistence.Repositories;

public class Repository<TEntity>(
    ApplicationDbContext dbContext,
    IDateTimeProvider dateTimeProvider) : IRepository<TEntity>
    where TEntity : BaseEntity
{
    protected DbSet<TEntity> Entities { get; } = dbContext.Set<TEntity>();

    public async Task<TEntity?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await Entities.FindAsync([id], cancellationToken);
    }

    public async Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default)
    {
        await Entities.AddAsync(entity, cancellationToken);
    }

    public void Update(TEntity entity)
    {
        Entities.Update(entity);
    }

    public void Remove(TEntity entity)
    {
        entity.SoftDelete(dateTimeProvider.UtcNow);
        Entities.Update(entity);
    }
}
