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

echo "Application deployed and started successfully!"
