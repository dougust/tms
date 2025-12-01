#!/bin/bash
set -e

# Log all output
exec > >(tee -a /var/log/app-deployment.log)
exec 2>&1

echo "[DEPLOY]: Starting deployment at $(date)"

BUCKET_NAME=$1
APP_DIR="/home/ec2-user/app"

if [ -z "$BUCKET_NAME" ]; then
    echo "[DEPLOY]: ERROR - BUCKET_NAME not provided"
    exit 1
fi

echo "[DEPLOY]: Stopping application..."
su - ec2-user -c "pm2 stop dougust-api || true"

echo "[DEPLOY]: Downloading latest application from S3..."
aws s3 sync s3://${BUCKET_NAME}/app/ ${APP_DIR}/ --delete

echo "[DEPLOY]: Installing/updating dependencies..."
cd ${APP_DIR}
npm ci --omit=dev

echo "[DEPLOY]: Fixing permissions..."
chown -R ec2-user:ec2-user ${APP_DIR}

echo "[DEPLOY]: Restarting application..."
su - ec2-user -c "cd ${APP_DIR} && pm2 restart dougust-api"

echo "[DEPLOY]: Deployment completed successfully at $(date)"
