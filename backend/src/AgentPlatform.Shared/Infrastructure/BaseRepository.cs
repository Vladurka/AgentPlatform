using System.Linq.Expressions;
using AgentPlatform.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Shared.Infrastructure;

public abstract class BaseRepository<T>(DbContext context) : IRepository<T> where T : BaseEntity
{
    protected readonly DbContext Context = context;
    protected readonly DbSet<T> DbSet = context.Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await DbSet.FindAsync([id], ct);

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default)
        => await DbSet.ToListAsync(ct);

    public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await DbSet.Where(predicate).ToListAsync(ct);

    public virtual async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await DbSet.AddAsync(entity, ct);
        return entity;
    }

    public virtual void Update(T entity) => DbSet.Update(entity);
    public virtual void Delete(T entity) => DbSet.Remove(entity);
}
