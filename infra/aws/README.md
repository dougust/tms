# Dougust AWS Infrastructure

AWS CDK infrastructure for deploying the Dougust NestJS application to EC2.

## Quick Start

### Prerequisites
- AWS Account
- AWS CLI configured (`aws configure`)
- Node.js and npm installed

### Deploy in 2 Steps

```bash
# 1. Create SSH key (first time only)
aws ec2 create-key-pair --key-name dougust-key \
  --query 'KeyMaterial' --output text > ~/.ssh/dougust-key.pem
chmod 400 ~/.ssh/dougust-key.pem

# 2. Run deployment script
cd infra/aws
./deploy.sh
```

That's it! Your application will be deployed and running.

## What Gets Deployed

- **EC2 Instance**: t2.micro (free tier eligible)
- **VPC**: Single-AZ public subnet
- **S3 Bucket**: Stores your built application
- **Security Groups**: SSH, HTTP, HTTPS, and port 3000
- **Elastic IP**: Static IP address
- **Nginx**: Reverse proxy (port 80 → 3000)
- **PM2**: Process manager for your Node.js app

## Cost

- **First 12 months**: $0/month (AWS free tier)
- **After free tier**: ~$11-15/month

## Deployment Options

### Option 1: Automated (Recommended)
Uses the `deploy.sh` script which handles everything:

```bash
./deploy.sh
```

### Option 2: Manual with Auto-Deploy from dist
```bash
# Build the app
cd ../..
nx build be --configuration=production

# Deploy
cd infra/aws
export EC2_KEY_NAME=dougust-key
export DEPLOY_FROM_DIST=true
npx cdk deploy
```

### Option 3: Infrastructure Only
```bash
export EC2_KEY_NAME=dougust-key
export DEPLOY_FROM_DIST=false
npx cdk deploy
```

Then manually deploy using SCP or Git (see DEPLOYMENT.md).

## Environment Variables

Configure in `bin/dougust.ts` or via environment:

```bash
export EC2_KEY_NAME=your-key-name
export DEPLOY_FROM_DIST=true
export NODE_ENV=production
export PORT=3000
# Add more as needed
```

## Files

- `lib/dougust-stack.ts` - CDK stack definition
- `bin/dougust.ts` - CDK app entry point
- `scripts/` - Shell scripts for EC2 user data
  - `setup-instance.sh` - Installs Node.js, PM2, and dependencies
  - `deploy-app.sh` - Downloads app from S3 and starts with PM2
  - `setup-nginx.sh` - Configures Nginx reverse proxy
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `README.md` - This file

## Common Tasks

### Deploy Application
```bash
./deploy.sh
```

### Update Application
```bash
# Build new version
nx build be --configuration=production

# Redeploy
export DEPLOY_FROM_DIST=true
npx cdk deploy

# SSH and restart
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
cd /home/ec2-user/app
aws s3 sync s3://<BUCKET_NAME>/app/ .
pm2 restart dougust-api
```

### Check Application Status
```bash
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
pm2 status
pm2 logs dougust-api
```

### Destroy Infrastructure
```bash
npx cdk destroy
```

## Outputs

After deployment, you'll see:

- **InstanceId**: EC2 instance ID
- **ElasticIP**: Static IP for your application
- **SSHCommand**: Command to SSH into instance
- **ApplicationURL**: HTTP URL to access your app
- **DeploymentBucket**: S3 bucket name (if using auto-deploy)

## Configuration

### Stack Props

The stack accepts these properties:

```typescript
{
  keyName: string;           // Required: EC2 SSH key name
  distPath?: string;         // Optional: Path to dist/apps/be
  environmentVariables?: {   // Optional: App environment vars
    [key: string]: string;
  };
}
```

### How distPath Works

When `distPath` is provided:
1. Creates S3 bucket
2. Uploads contents of `dist/apps/be/` to S3
3. EC2 instance downloads from S3 on boot
4. Automatically installs dependencies
5. Starts app with PM2

When `distPath` is not provided:
1. Infrastructure is created
2. You manually deploy the application

## Security Notes

1. **SSH Access**: Currently allows SSH from anywhere. Restrict in production:
   ```typescript
   securityGroup.addIngressRule(
     ec2.Peer.ipv4('YOUR_IP/32'),
     ec2.Port.tcp(22),
     'Allow SSH from my IP'
   );
   ```

2. **Environment Variables**: Stored in `.env` file. Use AWS Secrets Manager for sensitive data in production.

3. **HTTPS**: Add SSL certificate using Let's Encrypt or AWS Certificate Manager.

## Customizing Deployment Scripts

The EC2 user data is built from modular shell scripts in the `scripts/` directory:

1. **`setup-instance.sh`** - Base system setup
   - Updates system packages
   - Installs Node.js 20.x
   - Installs PM2

2. **`deploy-app.sh`** - Application deployment
   - Downloads from S3 (bucket name is templated)
   - Installs dependencies
   - Sets environment variables (content is templated)
   - Starts app with PM2

3. **`setup-nginx.sh`** - Reverse proxy configuration
   - Installs Nginx
   - Configures proxy to port 3000

To customize the deployment, edit these scripts directly. The CDK stack reads and combines them at synthesis time.

### Template Variables

The `deploy-app.sh` script uses these template variables (replaced by CDK):
- `{{BUCKET_NAME}}` - S3 bucket containing the app
- `{{ENV_FILE_CONTENT}}` - Environment variables from `bin/dougust.ts`

## Troubleshooting

### Can't SSH into instance
- Check security group allows port 22
- Verify key permissions: `chmod 400 ~/.ssh/dougust-key.pem`
- Use correct username: `ec2-user` for Amazon Linux

### Application not running
```bash
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
pm2 status                      # Check status
pm2 logs dougust-api            # View logs
sudo tail -f /var/log/user-data.log  # Check deployment logs
sudo tail -f /var/log/cloud-init-output.log  # Check startup logs
```

### Build fails
```bash
# Ensure you're in project root
nx build be --configuration=production

# Check dist folder exists
ls -la dist/apps/be/
```

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [NestJS Documentation](https://docs.nestjs.com/)

## Support

For issues related to:
- **Infrastructure**: Check CDK documentation
- **Application**: Check your NestJS app logs
- **AWS**: Check CloudWatch logs

## Next Steps

1. **Add Database**: Deploy RDS PostgreSQL (see DEPLOYMENT.md)
2. **Set up Domain**: Configure Route 53 or external DNS
3. **Enable HTTPS**: Add SSL certificate
4. **CI/CD**: Set up GitHub Actions or AWS CodePipeline
5. **Monitoring**: Configure CloudWatch alarms

---
## debuggin


sudo cat /var/log/cloud-init-output.log

cd /var/lib/cloud/instance/scripts

sudo /var/lib/cloud/instance/scripts/part-001

sudo su - ec2-user

pm2 status

curl http://localhost:3000/api/health


checking result of invocation command
```bash
aws ssm list-commands \
--instance-id i-0288f2d03f602b25d \
--max-results 10 \
--query 'Commands[*].{CommandId:CommandId,Status:Status,Time:RequestedDateTime,Comment:Comment}' \
--output table
```

```bash
aws ssm get-command-invocation \
--command-id 4dbc599a-b8bf-4fe5-a1a2-6b0bd1e494df \
--instance-id i-0288f2d03f602b25d \
--output json
```

## Debugging nest in the instance

```bash
sudo su - ec2-user
```


curl http://3.213.105.143/api/health


sudo systemctl start nginx
sudo systemctl enable nginx

## Running unit tests

Run `nx test infra` to execute the unit tests via [Jest](https://jestjs.io).
