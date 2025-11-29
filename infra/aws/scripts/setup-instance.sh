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

echo "Instance setup complete!"
