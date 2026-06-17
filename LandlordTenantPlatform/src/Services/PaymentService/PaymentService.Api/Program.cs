using BuildingBlocks.Auth.Extensions;
using BuildingBlocks.Common.Extensions;
using BuildingBlocks.EventBus.Extensions;
using Microsoft.EntityFrameworkCore;
using PaymentService.Application.Commands;
using PaymentService.Application.Interfaces;
using PaymentService.Infrastructure.Data;
using PaymentService.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PaymentServiceDbContext>(options =>
    options.UseNpgsql(connectionString, x => x.MigrationsHistoryTable("__EFMigrationsHistory", "payment_schema")));

// Add Repositories
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

// Add MediatR & FluentValidation
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(InitiatePaymentCommand).Assembly));

// Add BuildingBlocks (Auth, EventBus)
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRabbitMqEventBus(builder.Configuration);

// Add Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware Pipeline
app.UseGlobalExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
