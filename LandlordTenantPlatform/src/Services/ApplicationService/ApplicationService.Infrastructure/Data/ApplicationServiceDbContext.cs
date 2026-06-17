using ApplicationEntity = ApplicationService.Domain.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace ApplicationService.Infrastructure.Data;

public class ApplicationServiceDbContext : DbContext
{
    public ApplicationServiceDbContext(DbContextOptions<ApplicationServiceDbContext> options) : base(options) { }

    public DbSet<ApplicationEntity> Applications => Set<ApplicationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
            
            // Indexes for fast lookups
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.PropertyId);
            entity.HasIndex(e => new { e.PropertyId, e.TenantId }).IsUnique();
        });
    }
}
