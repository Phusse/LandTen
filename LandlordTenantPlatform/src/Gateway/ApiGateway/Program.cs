using BuildingBlocks.Auth.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ── JWT validation (all downstream requests arrive pre-authenticated from the gateway,
//    but the gateway itself also validates tokens for defence-in-depth) ────────────────
builder.Services.AddJwtAuthentication(builder.Configuration);

// ── YARP Reverse Proxy ────────────────────────────────────────────────────────────────
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();

app.MapGet("/health", () => Results.Ok(new { service = "ApiGateway", status = "healthy" }));

app.Run();
