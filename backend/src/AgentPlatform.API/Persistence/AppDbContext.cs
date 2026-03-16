using AgentPlatform.Agents.Domain.Entities;
using AgentPlatform.Auth.Domain.Entities;
using AgentPlatform.Billing.Domain.Entities;
using AgentPlatform.Chat.Domain.Entities;
using AgentPlatform.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace AgentPlatform.API.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<KnowledgeSource> KnowledgeSources => Set<KnowledgeSource>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<UsageRecord> UsageRecords => Set<UsageRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.Plan).HasMaxLength(20).HasDefaultValue("free");
            e.Property(x => x.ApiKey).HasMaxLength(64);
            e.Property(x => x.StripeCustomerId).HasMaxLength(64);
            e.Property(x => x.StripeSubscriptionId).HasMaxLength(64);
        });

        modelBuilder.Entity<Agent>(e =>
        {
            e.ToTable("agents");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.EmbedToken).IsUnique();
            e.HasIndex(x => x.OwnerId);
            e.Property(x => x.Name).HasMaxLength(256).IsRequired();
            e.Property(x => x.Instructions).IsRequired();
            e.Property(x => x.EmbedToken).HasMaxLength(64).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasMany(x => x.KnowledgeSources).WithOne(x => x.Agent).HasForeignKey(x => x.AgentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<KnowledgeSource>(e =>
        {
            e.ToTable("knowledge_sources");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.AgentId);
            e.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<Conversation>(e =>
        {
            e.ToTable("conversations");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SessionId).IsUnique();
            e.HasIndex(x => x.AgentId);
            e.HasOne<Agent>().WithMany().HasForeignKey(x => x.AgentId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.SessionId).HasMaxLength(64).IsRequired();
            e.OwnsMany(x => x.Messages, m =>
            {
                m.ToJson();
            });
        });

        modelBuilder.Entity<UsageRecord>(e =>
        {
            e.ToTable("usage_records");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.Year, x.Month }).IsUnique();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(ct);
    }
}
