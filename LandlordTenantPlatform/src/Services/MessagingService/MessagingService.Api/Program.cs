using BuildingBlocks.Auth.Extensions;
using BuildingBlocks.Common.Extensions;
using BuildingBlocks.EventBus.Extensions;
using FluentValidation;
using MessagingService.Application.Commands.StartOrGetConversation;
using MessagingService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "MessagingService API", Version = "v1" });

    // Wire up Bearer token input in Swagger UI
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── JWT Auth ──────────────────────────────────────────────────────────────────
builder.Services.AddJwtAuthentication(builder.Configuration);

// ── Database & Repositories ─────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("MessagingServiceDb");
builder.Services.AddDbContext<MessagingDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<MessagingService.Application.Interfaces.IMessagingRepository, MessagingService.Infrastructure.Repositories.MessagingRepository>();

// ── MediatR ───────────────────────────────────────────────────────────────────
var applicationAssembly = typeof(StartOrGetConversationCommand).Assembly;
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));
builder.Services.AddValidatorsFromAssembly(applicationAssembly);

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<MessagingService.Application.Services.TypingStatusCache>();

builder.Services.Configure<BuildingBlocks.Common.Services.CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<BuildingBlocks.Common.Interfaces.IMediaStorageService, BuildingBlocks.Common.Services.CloudinaryMediaStorageService>();

// ── Rate Limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("MessageSpamPolicy", context =>
    {
        var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: userId ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                Window = TimeSpan.FromMinutes(1),
                PermitLimit = 30,
                QueueLimit = 0
            });
    });
});

// ── MassTransit / RabbitMQ ────────────────────────────────────────────────────
builder.Services.AddRabbitMqEventBus(builder.Configuration);

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalExceptionHandling();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { service = "MessagingService", status = "healthy" }));

app.Run();
