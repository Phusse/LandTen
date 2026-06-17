#!/bin/bash

# Load Environment Variables from root .env
if [ -f "../.env" ]; then
    set -a
    source "../.env"
    set +a
else
    echo "Warning: ../.env file not found. Starting with default/empty environment variables."
fi

# Map to .NET configuration keys
export ConnectionStrings__UserServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__PropertyServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__ApplicationServiceDb="${SUPABASE_DB_BASE}Ssl Mode=Require;Trust Server Certificate=true;Pooling=false;"
export ConnectionStrings__DefaultConnection="${SUPABASE_DB_BASE}Search Path=payment_schema;"

export Cloudinary__CloudName="${CLOUDINARY_CLOUD_NAME}"
export Cloudinary__ApiKey="${CLOUDINARY_API_KEY}"
export Cloudinary__ApiSecret="${CLOUDINARY_API_SECRET}"

export Jwt__Issuer="${JWT_ISSUER}"
export Jwt__Audience="${JWT_AUDIENCE}"
export Jwt__SecretKey="${JWT_SECRET_KEY}"

export Seed__SuperAdmin__Email="${SEED_SUPERADMIN_EMAIL}"
export Seed__SuperAdmin__Password="${SEED_SUPERADMIN_PASSWORD}"

export RabbitMq__Host="${RABBITMQ_HOST}"
export RabbitMq__Username="${RABBITMQ_USER}"
export RabbitMq__Password="${RABBITMQ_PASSWORD}"

export Payments__Paystack__SecretKey="${PAYSTACK_SECRET_KEY}"
export Payments__Flutterwave__SecretKey="${FLUTTERWAVE_SECRET_KEY}"

wait_for_port() {
    local port=$1
    while ! nc -z localhost $port >/dev/null 2>&1; do
        sleep 0.5
    done
}

echo "Building the solution once to prevent file lock conflicts..."
dotnet build LandlordTenantPlatform.sln

echo "Starting all services in the background..."

dotnet run --no-build --project src/Services/UserService/UserService.Api --urls "http://localhost:5001" &
USER_PID=$!

dotnet run --no-build --project src/Services/PropertyService/PropertyService.Api --urls "http://localhost:5002" &
PROP_PID=$!

dotnet run --no-build --project src/Services/ApplicationService/ApplicationService.Api --urls "http://localhost:5003" &
APP_PID=$!

dotnet run --no-build --project src/Services/PaymentService/PaymentService.Api --urls "http://localhost:5004" &
PAY_PID=$!

dotnet run --no-build --project src/Services/MessagingService/MessagingService.Api --urls "http://localhost:5005" &
MSG_PID=$!

dotnet run --no-build --project src/Services/NotificationService/NotificationService.Worker &
NOTIF_PID=$!

# Gateway routes requests to ports 5001-5005
export USERSERVICE_URL="http://localhost:5001"
export PROPERTYSERVICE_URL="http://localhost:5002"
export APPLICATIONSERVICE_URL="http://localhost:5003"
export PAYMENTSERVICE_URL="http://localhost:5004"
export MESSAGINGSERVICE_URL="http://localhost:5005"
dotnet run --no-build --project src/ApiGateway/ApiGateway --urls "http://localhost:5000" &
GW_PID=$!

trap "echo 'Stopping services...'; kill $USER_PID $PROP_PID $APP_PID $PAY_PID $MSG_PID $NOTIF_PID $GW_PID; exit" INT TERM

# Wait for ports and print success message for each one
( wait_for_port 5001 && echo "UserService has started running." ) &
( wait_for_port 5002 && echo "PropertyService has started running." ) &
( wait_for_port 5003 && echo "ApplicationService has started running." ) &
( wait_for_port 5004 && echo "PaymentService has started running." ) &
( wait_for_port 5005 && echo "MessagingService has started running." ) &
( sleep 5 && echo "NotificationService has started running." ) &
( wait_for_port 5000 && echo "ApiGateway has started running." ) &

echo "Waiting for all services to start..."

wait
