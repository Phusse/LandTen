using BuildingBlocks.Auth.Extensions;
using BuildingBlocks.Common.Extensions;
using BuildingBlocks.EventBus.Extensions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PropertyService.Application.Commands.CreateProperty;
using PropertyService.Application.Interfaces;
using PropertyService.Infrastructure.Data;
using PropertyService.Infrastructure.Repositories;
using BuildingBlocks.Common.Interfaces;
using BuildingBlocks.Common.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PropertyService API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// DbContext
builder.Services.AddDbContext<PropertyServiceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PropertyServiceDb")));

// Repositories & Services
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<IMediaStorageService, CloudinaryMediaStorageService>();

// MediatR & FluentValidation
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePropertyCommand).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(CreatePropertyCommandValidator).Assembly);

// JWT Authentication & Policies (from BuildingBlocks.Auth)
builder.Services.AddJwtAuthentication(builder.Configuration);

// EventBus (MassTransit)
builder.Services.AddRabbitMqEventBus(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalExceptionHandling(); // from BuildingBlocks.Common

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
