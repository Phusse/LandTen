using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UserService.Domain.Entities;

namespace UserService.Infrastructure.Data.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.HasIndex(x => x.RefreshToken).IsUnique();

        builder.Property(x => x.RefreshToken).IsRequired().HasMaxLength(255);
        builder.Property(x => x.DeviceInfo).HasMaxLength(255);
        builder.Property(x => x.IpAddress).HasMaxLength(50);
    }
}
