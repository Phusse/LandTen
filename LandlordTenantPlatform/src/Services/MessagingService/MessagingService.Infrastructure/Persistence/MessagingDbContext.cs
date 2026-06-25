using MessagingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MessagingService.Infrastructure.Persistence;

/// <summary>EF Core DbContext for MessagingService.</summary>
public sealed class MessagingDbContext : DbContext
{
    public MessagingDbContext(DbContextOptions<MessagingDbContext> options) : base(options) { }

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Conversation ──────────────────────────────────────────────────
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.User1Id).IsRequired();
            entity.Property(c => c.User2Id).IsRequired();
            entity.Property(c => c.PropertyId).IsRequired(false);
            entity.Property(c => c.CreatedAt).IsRequired();

            // Unique index enforces no-duplicate conversation rule at DB level.
            // PropertyId is nullable so we use the PostgreSQL approach:
            // two separate partial indexes won't work cleanly in EF, so we
            // include it in the composite key treating NULL as a fixed value.
            entity.HasIndex(c => new { c.User1Id, c.User2Id, c.PropertyId })
                  .IsUnique()
                  .HasDatabaseName("IX_Conversations_User1_User2_Property");

            entity.HasMany(c => c.Messages)
                  .WithOne(m => m.Conversation)
                  .HasForeignKey(m => m.ConversationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Message ───────────────────────────────────────────────────────
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.ConversationId).IsRequired();
            entity.Property(m => m.SenderId).IsRequired();
            entity.Property(m => m.Content).IsRequired().HasMaxLength(2000);
            entity.Property(m => m.IsRead).IsRequired().HasDefaultValue(false);
            entity.Property(m => m.CreatedAt).IsRequired();

            // Efficient reads for "get messages in conversation ordered by time"
            entity.HasIndex(m => new { m.ConversationId, m.CreatedAt })
                  .HasDatabaseName("IX_Messages_ConversationId_CreatedAt");

            // Efficient unread count query
            entity.HasIndex(m => new { m.ConversationId, m.SenderId, m.IsRead })
                  .HasDatabaseName("IX_Messages_ConversationId_SenderId_IsRead");
        });
    }
}
