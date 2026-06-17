using ApplicationService.Application.Commands.ApplyToProperty;
using ApplicationService.Application.Interfaces;
using ApplicationService.Infrastructure.Repositories;
using ApplicationService.Infrastructure.Data;
using ApplicationService.Infrastructure.HttpClients;
using BuildingBlocks.Auth.Extensions;
using BuildingBlocks.Common.Extensions;
using BuildingBlocks.Common.Exceptions;
using BuildingBlocks.EventBus.Extensions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Auth
builder.Services.AddJwtAuthentication(builder.Configuration);

// Database
var connectionString = builder.Configuration.GetConnectionString("ApplicationServiceDb");
builder.Services.AddDbContext<ApplicationServiceDbContext>(options =>
    options.UseNpgsql(connectionString));

// Repositories
builder.Services.AddScoped<IApplicationRepository, ApplicationRepository>();

// HttpClients
builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<JwtForwardingDelegatingHandler>();

builder.Services.AddHttpClient<IPropertyServiceClient, PropertyServiceClient>(client =>
{
    var baseUrl = builder.Configuration.GetValue<string>("Services:PropertyServiceBaseUrl");
    client.BaseAddress = new Uri(baseUrl ?? "http://localhost:5002");
})
.AddHttpMessageHandler<JwtForwardingDelegatingHandler>();

// MediatR & FluentValidation
var applicationAssembly = typeof(ApplyToPropertyCommand).Assembly;
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));
builder.Services.AddValidatorsFromAssembly(applicationAssembly);

// MassTransit
builder.Services.AddRabbitMqEventBus(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalExceptionHandling();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
