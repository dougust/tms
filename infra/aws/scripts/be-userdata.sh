#!/bin/bash
set -e

# Log all output to a file for debugging
exec > >(tee -a /var/log/user-data.log)
exec 2>&1

echo "[USERDATA]: Starting Dougust instance setup"
echo "[USERDATA]: Time: $(date)"

# ============================================================================
# ONE-TIME SYSTEM SETUP (only runs on instance creation)
# ============================================================================

echo "[USERDATA]: Starting one-time instance setup..."

# Update system
echo "[USERDATA]: Updating system packages..."
yum update -y

# Install Node.js 20.x (LTS)
echo "[USERDATA]: Installing Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Install PM2 globally for process management
echo "[USERDATA]: Installing PM2..."
npm install -g pm2

# Install Nginx
echo "[USERDATA]: Installing Nginx..."
dnf install -y nginx

# Create app directory
echo "[USERDATA]: Creating app directory..."
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

echo "[USERDATA]: Configuring Nginx as reverse proxy..."
cat > /etc/nginx/conf.d/dougust.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "[USERDATA]: Starting and enabling Nginx..."
systemctl start nginx
systemctl enable nginx

echo "[USERDATA]: One-time setup complete!"

# ============================================================================
# CREATE DEPLOYMENT SCRIPT (for future deployments via SSM)
# ============================================================================

echo "[USERDATA]: Creating deployment script..."
cat > /home/ec2-user/deploy-app.sh << 'DEPLOY_SCRIPT'
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
aws s3 sync s3://${BUCKET_NAME}/app/ ${APP_DIR}/ --delete --exact-timestamps

echo "[DEPLOY]: Installing/updating dependencies..."
cd ${APP_DIR}
npm ci --omit=dev

echo "[DEPLOY]: Fixing permissions..."
chown -R ec2-user:ec2-user ${APP_DIR}

echo "[DEPLOY]: Restarting application..."
su - ec2-user -c "cd ${APP_DIR} && pm2 restart dougust-api"

echo "[DEPLOY]: Deployment completed successfully at $(date)"
DEPLOY_SCRIPT

chmod +x /home/ec2-user/deploy-app.sh
chown ec2-user:ec2-user /home/ec2-user/deploy-app.sh

# ============================================================================
# INITIAL DEPLOYMENT
# ============================================================================

echo "[USERDATA]: Running initial deployment..."

echo "[USERDATA]: Downloading application from S3..."
aws s3 sync s3://{{BUCKET_NAME}}/app/ /home/ec2-user/app/

echo "[USERDATA]: Installing production dependencies..."
cd /home/ec2-user/app
npm ci --omit=dev

echo "[USERDATA]: Setting up environment variables..."
# First write the static environment variables
cat > /home/ec2-user/app/.env << 'EOF'
{{ENV_FILE_CONTENT}}
EOF

# Save a template copy for future deployments (without sensitive data)
cp /home/ec2-user/app/.env /home/ec2-user/.env.template

# If DB_SECRET_ARN is set, fetch database credentials from Secrets Manager
if grep -q "DB_SECRET_ARN=" /home/ec2-user/app/.env; then
  echo "[USERDATA]: Fetching database credentials from Secrets Manager..."

  # Install jq for JSON parsing (if not already installed)
  yum install -y jq

  # Extract DB connection info from environment variables
  DB_SECRET_ARN=$(grep DB_SECRET_ARN= /home/ec2-user/app/.env | cut -d= -f2)
  DB_HOST=$(grep DB_HOST= /home/ec2-user/app/.env | cut -d= -f2)
  DB_PORT=$(grep DB_PORT= /home/ec2-user/app/.env | cut -d= -f2)
  DB_NAME=$(grep DB_NAME= /home/ec2-user/app/.env | cut -d= -f2)

  # Fetch secret from Secrets Manager
  SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query SecretString --output text)

  # Parse username and password from secret
  DB_USERNAME=$(echo "$SECRET_JSON" | jq -r .username)
  DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r .password)

  # Construct DATABASE_URL
  DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

  # Append DATABASE_URL to .env file
  echo "DATABASE_URL=${DATABASE_URL}" >> /home/ec2-user/app/.env

  echo "[USERDATA]: Database credentials configured successfully"
fi

chown -R ec2-user:ec2-user /home/ec2-user/app

echo "[USERDATA]: Starting application with PM2..."
su - ec2-user -c "cd /home/ec2-user/app && pm2 start main.js --name dougust-api"

echo "[USERDATA]: Configuring PM2 to start on boot..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "[USERDATA]: Saving PM2 process list..."
su - ec2-user -c "pm2 save"

echo "[USERDATA]: Initial deployment complete!"

# ============================================================================
# COMPLETION
# ============================================================================

echo "[USERDATA]: All setup complete!"
echo "[USERDATA]: Time: $(date)"

# Create completion marker
echo "[USERDATA]: Instance setup complete!" > /home/ec2-user/setup-complete.txt
date >> /home/ec2-user/setup-complete.txt
