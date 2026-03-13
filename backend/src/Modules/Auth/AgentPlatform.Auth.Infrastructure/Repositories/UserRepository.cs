using AgentPlatform.Auth.Application.Interfaces;
using AgentPlatform.Auth.Domain.Entities;
using AgentPlatform.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.Auth.Infrastructure.Repositories;

public class UserRepository(DbContext context) : BaseRepository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default)
        => await DbSet.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, ct);

    public async Task<bool> ExistsAsync(string email, CancellationToken ct = default)
        => await DbSet.AnyAsync(u => u.Email == email, ct);
}
