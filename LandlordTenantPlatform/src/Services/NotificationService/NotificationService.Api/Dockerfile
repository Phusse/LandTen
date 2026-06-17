FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore "src/Services/NotificationService/NotificationService.Api/NotificationService.Api.csproj"

RUN dotnet publish "src/Services/NotificationService/NotificationService.Api/NotificationService.Api.csproj" \
    -c Release -o /app/publish --no-restore

# Worker Service uses the base runtime image (not aspnet) but aspnet works too
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NotificationService.Api.dll"]
