using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(UserServiceDbContext context, IConfiguration configuration, ILogger logger)
    {
        try
        {
            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == (configuration["Seed:SuperAdmin:Email"] ?? "dubem@dev.com"));
            if (adminUser == null)
            {
                logger.LogInformation("Seeding superadmin account...");

                var email = configuration["Seed:SuperAdmin:Email"] ?? "dubem@dev.com";
                var password = configuration["Seed:SuperAdmin:Password"];
                if (string.IsNullOrEmpty(password))
                {
                    throw new System.InvalidOperationException("SuperAdmin password must be provided via configuration or environment variables.");
                }
                var phone = "00000000000";

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

                adminUser = new User(email, phone, passwordHash, UserRole.SuperAdmin);

                // Admin accounts shouldn't be blocked by normal KYC flow
                // State machine requires Unverified -> Pending -> Verified
                adminUser.ChangeVerificationStatus(VerificationStatus.Pending);
                adminUser.ChangeVerificationStatus(VerificationStatus.Verified);

                var adminProfile = new UserProfile
                {
                    UserId = adminUser.Id,
                    FirstName = "Super",
                    LastName = "Admin",
                    User = adminUser
                };

                adminUser.UserProfile = adminProfile;

                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();

                logger.LogInformation("Superadmin account seeded successfully.");
            }
            else
            {
                if (adminUser.Role != UserRole.SuperAdmin)
                {
                    logger.LogInformation("Upgrading existing admin account to Superadmin...");
                    adminUser.Role = UserRole.SuperAdmin;
                    await context.SaveChangesAsync();
                    logger.LogInformation("Upgraded to Superadmin successfully.");
                }
                else 
                {
                    logger.LogInformation("Superadmin account already exists, skipping seed.");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the superadmin account.");
        }
    }
}
