#!/bin/bash
set -e

echo "Applying migrations to Supabase..."

# Load Environment Variables from root .env
if [ -f "../.env" ]; then
    set -a
    source "../.env"
    set +a
else
    echo "Error: ../.env file not found. Migrations need secrets!"
    exit 1
fi

export ConnectionStrings__UserServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__PropertyServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__ApplicationServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__PaymentServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__MessagingServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__DefaultConnection="${SUPABASE_DB_BASE}Search Path=payment_schema;"

cd /Users/Dubem/Documents/LandTen/LandlordTenantPlatform/src/Services

echo "User Service..."
dotnet ef database update --project UserService/UserService.Infrastructure --startup-project UserService/UserService.Api

echo "Property Service..."
dotnet ef database update --project PropertyService/PropertyService.Infrastructure --startup-project PropertyService/PropertyService.Api

echo "Application Service..."
dotnet ef database update --context ApplicationServiceDbContext --project ApplicationService/ApplicationService.Infrastructure --startup-project ApplicationService/ApplicationService.Api


echo "Payment Service..."
dotnet ef database update --context PaymentServiceDbContext --project PaymentService/PaymentService.Infrastructure --startup-project PaymentService/PaymentService.Api

echo "Messaging Service..."
dotnet ef database update --context MessagingDbContext --project MessagingService/MessagingService.Infrastructure --startup-project MessagingService/MessagingService.Api

echo "All migrations applied!"

