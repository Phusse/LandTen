# =============================================================================
#  UserService.Api — Multi-stage Dockerfile
#  Build context: solution root (LandlordTenantPlatform/)
# =============================================================================

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything and restore — layer-caching optimised copy follows for prod,
# but for scaffolding this single COPY is simpler and correct.
COPY . .

RUN dotnet restore "src/Services/UserService/UserService.Api/UserService.Api.csproj"

RUN dotnet publish "src/Services/UserService/UserService.Api/UserService.Api.csproj" \
    -c Release -o /app/publish --no-restore

# ── Runtime image ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "UserService.Api.dll"]
