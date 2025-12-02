#!/bin/bash
set -e

# Log all output
exec > >(tee -a /var/log/app-deployment.log)
exec 2>&1

echo "[DEPLOY]: Starting deployment at $(date)"

BUCKET_NAME=$1
APP_DIR="/home/ec2-user/app"
ENV_BACKUP="/tmp/.env.backup"

if [ -z "$BUCKET_NAME" ]; then
    echo "[DEPLOY]: ERROR - BUCKET_NAME not provided"
    exit 1
fi

echo "[DEPLOY]: Stopping application..."
su - ec2-user -c "pm2 stop dougust-api || true"

# Backup .env file before syncing (to preserve database credentials)
if [ -f "${APP_DIR}/.env" ]; then
  echo "[DEPLOY]: Backing up .env file..."
  cp "${APP_DIR}/.env" "${ENV_BACKUP}"
fi

echo "[DEPLOY]: Downloading latest application from S3..."
aws s3 sync s3://${BUCKET_NAME}/app/ ${APP_DIR}/ --delete

# Restore .env file after sync
if [ -f "${ENV_BACKUP}" ]; then
  echo "[DEPLOY]: Restoring .env file..."
  cp "${ENV_BACKUP}" "${APP_DIR}/.env"
  rm "${ENV_BACKUP}"
else
  echo "[DEPLOY]: WARNING - No .env backup found, recreating from environment..."
  # If no backup exists, try to recreate .env from Secrets Manager
  # This handles the case where .env was accidentally deleted

  # Check if we have the necessary environment info in a known location
  if [ -f "/home/ec2-user/.env.template" ]; then
    echo "[DEPLOY]: Recreating .env from template..."
    cp /home/ec2-user/.env.template ${APP_DIR}/.env

    # If DB_SECRET_ARN is set, fetch database credentials
    if grep -q "DB_SECRET_ARN=" ${APP_DIR}/.env; then
      echo "[DEPLOY]: Fetching database credentials from Secrets Manager..."

      # Install jq if not present
      yum install -y jq 2>/dev/null || true

      # Extract DB connection info
      DB_SECRET_ARN=$(grep DB_SECRET_ARN= ${APP_DIR}/.env | cut -d= -f2)
      DB_HOST=$(grep DB_HOST= ${APP_DIR}/.env | cut -d= -f2)
      DB_PORT=$(grep DB_PORT= ${APP_DIR}/.env | cut -d= -f2)
      DB_NAME=$(grep DB_NAME= ${APP_DIR}/.env | cut -d= -f2)

      # Fetch secret
      SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query SecretString --output text)

      # Parse credentials
      DB_USERNAME=$(echo "$SECRET_JSON" | jq -r .username)
      DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r .password)

      # Construct DATABASE_URL
      DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

      # Append to .env
      echo "DATABASE_URL=${DATABASE_URL}" >> ${APP_DIR}/.env

      echo "[DEPLOY]: Database credentials configured"
    fi
  else
    echo "[DEPLOY]: ERROR - No .env backup and no template found!"
    echo "[DEPLOY]: Application may fail to start without proper configuration"
  fi
fi

echo "[DEPLOY]: Installing/updating dependencies..."
cd ${APP_DIR}
npm ci --omit=dev

echo "[DEPLOY]: Fixing permissions..."
chown -R ec2-user:ec2-user ${APP_DIR}

echo "[DEPLOY]: Restarting application..."
su - ec2-user -c "cd ${APP_DIR} && pm2 restart dougust-api"

echo "[DEPLOY]: Deployment completed successfully at $(date)"
