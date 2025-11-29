# AWS EC2 Deployment Guide for Dougust NestJS Application

## Overview
This guide explains how to deploy your NestJS application to AWS EC2 using the AWS CDK infrastructure defined in this project.

## Infrastructure Components

### Free Tier Resources
All resources are configured to use AWS Free Tier eligible options:

1. **EC2 Instance**: t2.micro (750 hours/month free for 12 months)
2. **EBS Volume**: 30 GB gp3 storage (30 GB free for 12 months)
3. **Elastic IP**: Free when associated with a running instance
4. **VPC**: Free (default limit is 5 VPCs per region)
5. **Security Groups**: Free
6. **Data Transfer**: 1 GB outbound free per month

### What's Included

- **VPC**: Custom VPC with public subnet in a single Availability Zone
- **EC2 Instance**: t2.micro running Amazon Linux 2023
- **Security Group**: Configured to allow:
  - SSH (port 22) - for remote access
  - HTTP (port 80) - for web traffic via Nginx
  - HTTPS (port 443) - for SSL traffic
  - Port 3000 - direct access to NestJS app
- **IAM Role**: With permissions for:
  - CloudWatch Logs (monitoring)
  - Systems Manager (SSM for easier management)
- **Nginx**: Reverse proxy configured to forward traffic to your NestJS app
- **PM2**: Process manager for running Node.js applications
- **Elastic IP**: Static IP address for your instance

## Prerequisites

### 1. AWS Account Setup
- Create an AWS account (if you don't have one)
- Install and configure AWS CLI:
  ```bash
  # Install AWS CLI
  # macOS
  brew install awscli

  # Configure AWS credentials
  aws configure
  ```
  You'll need:
  - AWS Access Key ID
  - AWS Secret Access Key
  - Default region (e.g., us-east-1)

### 2. Create EC2 Key Pair
You need an SSH key pair to connect to your EC2 instance:

```bash
# Create key pair via AWS CLI
aws ec2 create-key-pair \
  --key-name dougust-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/dougust-key.pem

# Set proper permissions
chmod 400 ~/.ssh/dougust-key.pem
```

Alternatively, create it via AWS Console:
1. Go to EC2 Dashboard > Key Pairs
2. Click "Create key pair"
3. Name: `dougust-key`
4. Type: RSA
5. Format: .pem
6. Save the downloaded file to `~/.ssh/dougust-key.pem`

### 3. Update CDK Stack (Important!)
The current stack doesn't specify a key pair. You need to add it:

Edit `infra/aws/lib/dougust-stack.ts` and add `keyName` to the EC2 instance:

```typescript
const instance = new ec2.Instance(this, 'DougustInstance', {
  vpc,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
  },
  role,
  securityGroup,
  instanceType: ec2.InstanceType.of(
    ec2.InstanceClass.T2,
    ec2.InstanceSize.MICRO
  ),
  machineImage: new ec2.AmazonLinuxImage({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
    cpuType: ec2.AmazonLinuxCpuType.X86_64,
  }),
  keyName: 'dougust-key', // ADD THIS LINE
  userData,
  blockDevices: [
    {
      deviceName: '/dev/xvda',
      volume: ec2.BlockDeviceVolume.ebs(30, {
        volumeType: ec2.EbsDeviceVolumeType.GP3,
        encrypted: true,
      }),
    },
  ],
});
```

## Deployment Steps

### Quick Start (Automated Deployment)

The easiest way to deploy is using the automated deployment script:

```bash
# 1. Create EC2 key pair (first time only)
aws ec2 create-key-pair \
  --key-name dougust-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/dougust-key.pem
chmod 400 ~/.ssh/dougust-key.pem

# 2. Run the deployment script from infra/aws directory
cd infra/aws
./deploy.sh
```

The script will:
1. Build your NestJS application (`nx build be --configuration=production`)
2. Check AWS credentials
3. Verify EC2 key pair exists
4. Bootstrap CDK (if needed)
5. Upload your built app to S3
6. Deploy the infrastructure
7. EC2 instance automatically downloads and starts your app

**That's it!** Your application will be running within 5-10 minutes.

---

### Manual Deployment Steps

If you prefer to deploy manually or customize the process:

#### 1. Create EC2 Key Pair (First Time Only)
```bash
aws ec2 create-key-pair \
  --key-name dougust-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/dougust-key.pem
chmod 400 ~/.ssh/dougust-key.pem
```

#### 2. Bootstrap CDK (First Time Only)
```bash
cd infra/aws
npx cdk bootstrap
```

#### 3. Build Your Application
```bash
# From project root
nx build be --configuration=production
```

This creates the production build in `dist/apps/be/`.

#### 4. Deploy with Automatic App Upload

Set environment variables and deploy:

```bash
cd infra/aws

# Deploy with automatic app upload from dist folder
export EC2_KEY_NAME=dougust-key
export DEPLOY_FROM_DIST=true
npx cdk deploy
```

The deployment will:
- Create VPC and networking resources
- Create S3 bucket
- Upload `dist/apps/be` to S3
- Launch EC2 instance
- Install Node.js, PM2, and Nginx
- Download your app from S3
- Install dependencies
- Start the app with PM2
- Configure Nginx reverse proxy
- Allocate Elastic IP

**Note**: The stack outputs will show you:
- Instance ID
- Public IP
- Elastic IP
- S3 bucket name
- SSH command
- Application URLs

#### 5. Deploy without Automatic Upload (Manual Deployment)

If you don't want to use S3 for deployment:

```bash
cd infra/aws

# Deploy infrastructure only (no app upload)
export EC2_KEY_NAME=dougust-key
export DEPLOY_FROM_DIST=false  # or leave unset
npx cdk deploy
```

Then manually deploy your application using one of the options below.

---

## Manual Application Deployment Options

If you deployed without automatic upload, or want to update your application:

### Option A: Deploy from dist via SCP (Recommended)

This is the simplest way to deploy your pre-built application:

```bash
# 1. Build the application (from project root)
nx build be --configuration=production

# 2. Create a tarball of the built app
cd dist/apps/be
tar -czf ../../../dougust-be.tar.gz .
cd ../../..

# 3. Copy to EC2 instance (replace <ELASTIC_IP> with your IP from CDK outputs)
scp -i ~/.ssh/dougust-key.pem dougust-be.tar.gz ec2-user@<ELASTIC_IP>:/home/ec2-user/

# 4. SSH into the instance
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>

# 5. On the EC2 instance - extract and install
cd /home/ec2-user/app
tar -xzf ../dougust-be.tar.gz
npm ci --production

# 6. Set up environment variables
nano .env
# Add your production environment variables:
# NODE_ENV=production
# PORT=3000
# DATABASE_URL=...

# 7. Start the application with PM2
pm2 start main.js --name dougust-api
pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

# 8. Verify it's running
pm2 status
curl http://localhost:3000/api
```

#### Option B: Deploy from Git Repository

```bash
# 1. SSH into the instance
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>

# 2. Clone your repository
cd /home/ec2-user/app
git clone <your-repo-url> .

# 3. Install dependencies
npm ci

# 4. Build the application
npx nx build be --configuration=production

# 5. Set up environment variables
nano .env

# 6. Start with PM2
pm2 start dist/apps/be/main.js --name dougust-api
pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save
```

#### Option C: Use S3 for Artifact Storage (Recommended for CI/CD)

This requires adding S3 permissions to your EC2 IAM role. Update the stack to add S3 read permissions.

### 6. Verify Deployment

```bash
# Check if the application is running
curl http://<ELASTIC_IP>:3000/api

# Or via Nginx
curl http://<ELASTIC_IP>
```

## Environment Variables

Create a `.env` file on the EC2 instance with your production settings:

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Add other environment variables your app needs
```

## Database Setup

Your NestJS app likely needs a database. Options:

### Option 1: RDS Free Tier (Recommended)
Add RDS to your CDK stack:
- db.t3.micro or db.t4g.micro (750 hours/month free)
- 20 GB storage (free tier)
- PostgreSQL or MySQL

### Option 2: Database on EC2 Instance
Install PostgreSQL on the same EC2 instance (not recommended for production):

```bash
sudo dnf install postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Option 3: External Database Service
- Use Neon, Supabase, or PlanetScale free tiers
- Update DATABASE_URL in .env

## Monitoring and Logs

### Application Logs
```bash
# SSH into the instance
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>

# View PM2 logs
pm2 logs dougust-api

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### System Logs
Access via AWS CloudWatch Logs or SSH:
```bash
# System logs
sudo journalctl -u nginx
```

## Updating Your Application

### Option 1: Update via Automated Script (Recommended)

If you deployed with `DEPLOY_FROM_DIST=true`, simply run:

```bash
# 1. Build the updated app
nx build be --configuration=production

# 2. Deploy (this will update the S3 bucket and you can manually restart)
cd infra/aws
export EC2_KEY_NAME=dougust-key
export DEPLOY_FROM_DIST=true
npx cdk deploy

# 3. SSH into instance and update
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
cd /home/ec2-user/app

# 4. Download latest from S3 (get bucket name from CDK outputs)
aws s3 sync s3://<DEPLOYMENT_BUCKET_NAME>/app/ .

# 5. Reinstall dependencies (if package.json changed)
npm ci --production

# 6. Restart the app
pm2 restart dougust-api
```

### Option 2: Update via SCP

```bash
# 1. Build the updated app
nx build be --configuration=production

# 2. Create tarball
cd dist/apps/be
tar -czf ../../../dougust-be.tar.gz .
cd ../../..

# 3. Copy to instance
scp -i ~/.ssh/dougust-key.pem dougust-be.tar.gz ec2-user@<ELASTIC_IP>:/home/ec2-user/

# 4. SSH and update
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
cd /home/ec2-user/app
tar -xzf ../dougust-be.tar.gz
npm ci --production
pm2 restart dougust-api
```

### Option 3: Update via Git

```bash
# SSH into the instance
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>

# Navigate to app directory
cd /home/ec2-user/app

# Pull latest changes
git pull

# Install dependencies
npm ci --production

# Rebuild
npx nx build be --configuration=production

# Restart the application
pm2 restart dougust-api
```

## Cost Optimization Tips

1. **Stop instance when not in use**: EC2 free tier is 750 hours/month
   ```bash
   aws ec2 stop-instances --instance-ids <INSTANCE_ID>
   aws ec2 start-instances --instance-ids <INSTANCE_ID>
   ```

2. **Release Elastic IP if not in use**: Unassociated EIPs cost $0.005/hour

3. **Monitor data transfer**: After 1 GB/month, you pay for outbound data

4. **Use CloudWatch Free Tier**:
   - 10 custom metrics
   - 10 alarms
   - 5 GB log ingestion

## Security Best Practices

### 1. Restrict SSH Access
Update the security group to allow SSH only from your IP:

```typescript
securityGroup.addIngressRule(
  ec2.Peer.ipv4('YOUR_IP_ADDRESS/32'),  // Replace with your IP
  ec2.Port.tcp(22),
  'Allow SSH from my IP'
);
```

### 2. Set Up SSL/HTTPS
Use AWS Certificate Manager (free) + Application Load Balancer, or use Let's Encrypt:

```bash
# Install certbot
sudo dnf install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### 3. Enable CloudWatch Monitoring
Already included via IAM role permissions.

### 4. Regular Updates
```bash
sudo yum update -y
```

### 5. Use Secrets Manager or Parameter Store
Store sensitive data (API keys, database passwords) in AWS Secrets Manager or Systems Manager Parameter Store instead of .env files.

## Troubleshooting

### Instance not accessible
1. Check security group rules
2. Verify Elastic IP is associated
3. Check that instance is running: `aws ec2 describe-instances --instance-ids <INSTANCE_ID>`

### Application not starting
1. SSH into instance
2. Check PM2 status: `pm2 status`
3. View logs: `pm2 logs dougust-api`
4. Check if Node.js is installed: `node --version`

### Nginx issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Can't SSH into instance
1. Verify key permissions: `chmod 400 ~/.ssh/dougust-key.pem`
2. Check security group allows port 22
3. Verify using correct username: `ec2-user` for Amazon Linux

## Cleanup (Destroy Resources)

To avoid charges after free tier expires:

```bash
cd infra/aws
npx cdk destroy
```

This will delete all resources created by the stack.

## Next Steps

1. **Set up CI/CD**: Use GitHub Actions or AWS CodePipeline for automated deployments
2. **Add Database**: Deploy RDS PostgreSQL in free tier
3. **Set up Domain**: Use Route 53 or external DNS provider
4. **Enable HTTPS**: Get SSL certificate via ACM or Let's Encrypt
5. **Add Monitoring**: Set up CloudWatch alarms for CPU, memory, disk usage
6. **Backup Strategy**: Set up automated EBS snapshots or database backups

## Cost Estimation

### First 12 Months (Free Tier)
- **EC2 t2.micro**: $0 (750 hours/month)
- **EBS 30GB**: $0 (30 GB free)
- **Elastic IP**: $0 (when associated)
- **Data Transfer**: $0 (first 1 GB)
- **Total**: ~$0/month (assuming low traffic)

### After Free Tier (Estimated)
- **EC2 t2.micro**: ~$8.50/month
- **EBS 30GB gp3**: ~$2.40/month
- **Data Transfer**: $0.09/GB after 1 GB
- **Total**: ~$11-15/month

## Support and Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
