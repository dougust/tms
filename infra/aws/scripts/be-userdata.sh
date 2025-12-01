#!/bin/bash
set -e

# Log all output to a file for debugging
exec > >(tee -a /var/log/user-data.log)
exec 2>&1

echo "[USERDATA]: Starting Dougust deployment 1"
echo "[USERDATA]: Time: $(date)"

echo "[USERDATA]: Starting instance setup..."

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

# Create app directory
echo "[USERDATA]: Creating app directory..."
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app


echo "[USERDATA]: Instance setup complete!"

echo "[USERDATA]: Downloading application from S3..."
aws s3 sync s3://{{BUCKET_NAME}}/app/ /home/ec2-user/app/

echo "[USERDATA]: Installing production dependencies..."
cd /home/ec2-user/app
ls
npm ci --omit=dev

echo "[USERDATA]: Setting up environment variables..."
cat > /home/ec2-user/app/.env << 'EOF'
{{ENV_FILE_CONTENT}}
EOF

chown -R ec2-user:ec2-user /home/ec2-user/app

echo "[USERDATA]: Starting application with PM2..."
su - ec2-user -c "cd /home/ec2-user/app && pm2 start main.js --name dougust-api"

echo "[USERDATA]: Configuring PM2 to start on boot..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "[USERDATA]: Saving PM2 process list..."
su - ec2-user -c "pm2 save"

echo "[USERDATA]: Application deployed and started successfully!"

echo "[USERDATA]: Installing Nginx..."
dnf install -y nginx

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


echo "[USERDATA]: Nginx setup complete!"
echo "[USERDATA]: Deployment complete!"
echo "[USERDATA]: Time: $(date)"

# Create completion marker
echo "[USERDATA]: Instance setup complete!" > /home/ec2-user/setup-complete.txt
date >> /home/ec2-user/setup-complete.txt
