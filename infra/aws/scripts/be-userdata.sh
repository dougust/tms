#!/bin/bash
set -e

# Log all output to a file for debugging
exec > >(tee -a /var/log/user-data.log)
exec 2>&1

echo "========================================="
echo "Starting Dougust deployment"
echo "Time: $(date)"
echo "========================================="

echo "Starting instance setup..."

# Update system
echo "Updating system packages..."
yum update -y

# Install Node.js 20.x (LTS)
echo "Installing Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Install PM2 globally for process management
echo "Installing PM2..."
npm install -g pm2

# Create app directory
echo "Creating app directory..."
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app


echo "========================================="
echo "Instance setup complete!"
echo "Time: $(date)"
echo "========================================="

echo "Downloading application from S3..."
aws s3 sync s3://{{BUCKET_NAME}}/app/ /home/ec2-user/app/

echo "Installing production dependencies..."
cd /home/ec2-user/app
npm ci --production

echo "Setting up environment variables..."
cat > /home/ec2-user/app/.env << 'EOF'
{{ENV_FILE_CONTENT}}
EOF

echo "Changing ownership to ec2-user..."
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "Starting application with PM2..."
su - ec2-user -c "cd /home/ec2-user/app && pm2 start main.js --name dougust-api"
su - ec2-user -c "pm2 startup systemd -u ec2-user --hp /home/ec2-user"
su - ec2-user -c "pm2 save"

echo "========================================="
echo "Application deployed and started successfully!"
echo "Time: $(date)"
echo "========================================="

echo "Installing Nginx..."
dnf install -y nginx

echo "Configuring Nginx as reverse proxy..."
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

echo "Starting and enabling Nginx..."
systemctl start nginx
systemctl enable nginx


echo "========================================="
echo "Nginx setup complete!"
echo "Deployment complete!"
echo "Time: $(date)"
echo "========================================="

# Create completion marker
echo "Instance setup complete!" > /home/ec2-user/setup-complete.txt
date >> /home/ec2-user/setup-complete.txt
