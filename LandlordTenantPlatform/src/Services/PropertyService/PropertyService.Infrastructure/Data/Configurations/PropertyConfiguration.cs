using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PropertyService.Domain.Entities;

namespace PropertyService.Infrastructure.Data.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.HasKey(x => x.Id);

        // Required fields
        builder.Property(x => x.Title).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Address).IsRequired().HasMaxLength(500);
        builder.Property(x => x.City).IsRequired().HasMaxLength(100);
        builder.Property(x => x.State).IsRequired().HasMaxLength(100);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Search indexes
        builder.HasIndex(x => x.City);
        builder.HasIndex(x => x.State);
        builder.HasIndex(x => x.RentPrice);
        builder.HasIndex(x => x.Rooms);

        // Relationships
        builder.HasMany(x => x.Images)
            .WithOne(x => x.Property)
            .HasForeignKey(x => x.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
