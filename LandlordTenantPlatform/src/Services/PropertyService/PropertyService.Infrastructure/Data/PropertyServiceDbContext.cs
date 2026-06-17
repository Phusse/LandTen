using Microsoft.EntityFrameworkCore;
using PropertyService.Domain.Entities;

namespace PropertyService.Infrastructure.Data;

public class PropertyServiceDbContext : DbContext
{
    public PropertyServiceDbContext(DbContextOptions<PropertyServiceDbContext> options) : base(options) { }

    public DbSet<Property> Properties { get; set; }
    public DbSet<PropertyImage> PropertyImages { get; set; }
    public DbSet<PropertyDocument> PropertyDocuments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PropertyServiceDbContext).Assembly);
    }
}
