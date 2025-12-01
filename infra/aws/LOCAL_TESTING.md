# Local EC2 Testing with Docker

Test your **actual EC2 user data script** (`be-userdata.sh`) locally before deploying to AWS.

This setup uses the same Amazon Linux 2023 image as your EC2 instance and runs the exact same script, just with placeholders replaced and S3 sync skipped (app is mounted via Docker volume instead).

## Prerequisites

- Docker installed
- Application built in `../../dist` folder

## Quick Start

### Option 1: Using the Test Script (Easiest)

```bash
# Make sure your app is built first
cd /path/to/dougust2
npm run build  # or whatever your build command is

# Navigate to infra/aws and run the test script
cd infra/aws
./scripts/test-locally.sh

# Access the app
# - App directly: http://localhost:3000
# - Through Nginx: http://localhost:8080
```

### Option 2: Using Docker Compose

```bash
# Build your app first
npm run build

# Navigate to infra/aws
cd infra/aws

# Start the container
docker-compose -f docker-compose.local.yml up

# Access the app at http://localhost:3000 or http://localhost:8080
```

### Option 3: Manual Docker Run

```bash
# Build your app first
npm run build

# Run the container
docker run -it --rm \
  --privileged \
  -p 3000:3000 \
  -p 8080:80 \
  -v $(pwd)/../../dist:/home/ec2-user/app:ro \
  -v $(pwd)/scripts/local-setup.sh:/setup.sh:ro \
  public.ecr.aws/amazonlinux/amazonlinux:2023 \
  /bin/bash -c "chmod +x /setup.sh && /setup.sh"
```

### Option 3: Interactive Testing (Best for Debugging)

```bash
# Start a container with bash
docker run -it --rm \
  --privileged \
  -p 3000:3000 \
  -p 8080:80 \
  -v $(pwd)/../../dist:/home/ec2-user/app:ro \
  -v $(pwd)/scripts/be-userdata.sh:/userdata.sh:ro \
  public.ecr.aws/amazonlinux/amazonlinux:2023 \
  /bin/bash

# Inside the container, run commands manually:
# yum update -y
# curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
# yum install -y nodejs
# npm install -g pm2
# etc...
```

## Testing the User Data Script

To test the actual EC2 user data script (with placeholders replaced):

```bash
# Create a test version with placeholders filled in
cd infra/aws

# Replace placeholders manually for testing
cp scripts/be-userdata.sh scripts/test-userdata.sh

# Edit test-userdata.sh and replace:
# {{BUCKET_NAME}} with a dummy value or remove the S3 sync line
# {{ENV_FILE_CONTENT}} with your actual env vars

# Run it in the container
docker run -it --rm \
  --privileged \
  -p 3000:3000 \
  -p 8080:80 \
  -v $(pwd)/../../dist:/home/ec2-user/app:ro \
  -v $(pwd)/scripts/test-userdata.sh:/userdata.sh:ro \
  public.ecr.aws/amazonlinux/amazonlinux:2023 \
  /bin/bash -c "chmod +x /userdata.sh && /userdata.sh"
```

## Checking Logs

```bash
# In a running container
docker exec -it dougust-ec2-simulator bash

# Once inside:
cat /var/log/user-data.log  # Your script logs
su - ec2-user -c "pm2 logs"  # PM2 logs
systemctl status nginx       # Nginx status
curl localhost:3000         # Test the app directly
curl localhost:80           # Test through Nginx
```

## Common Issues

### systemd not working
Amazon Linux 2023 in Docker requires `--privileged` mode for systemd services like Nginx. This is added in the docker-compose file.

### App not found
Make sure you've built your application first (`npm run build`) and the `dist` folder exists.

### Port conflicts
If ports 3000 or 8080 are already in use, change them in docker-compose.local.yml:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
  - "8081:80"    # Use 8081 instead of 8080
```

## Benefits of Local Testing

- ✅ Test user data scripts without deploying to AWS
- ✅ Faster iteration (no waiting for EC2 instance launch)
- ✅ No AWS costs during development
- ✅ Easy to debug with interactive mode
- ✅ Same OS environment as production (Amazon Linux 2023)
