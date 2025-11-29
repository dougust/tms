#!/bin/bash
set -e

# Deployment script for Dougust NestJS application to AWS EC2
# This script builds the application and deploys it using AWS CDK

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_KEY_NAME="${EC2_KEY_NAME:-dougust-key}"
DEPLOY_FROM_DIST="${DEPLOY_FROM_DIST:-true}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Dougust AWS EC2 Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "../../package.json" ]; then
  echo -e "${RED}Error: This script should be run from infra/aws directory${NC}"
  exit 1
fi

# Step 1: Build the application
echo -e "${YELLOW}Step 1: Building the NestJS application...${NC}"
cd ../..
nx build be --configuration=production

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Check if dist/apps/be exists
if [ ! -d "dist/apps/be" ]; then
  echo -e "${RED}Error: dist/apps/be directory not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Built application found at dist/apps/be${NC}"
echo ""

# Step 2: Navigate back to CDK directory
cd infra/aws

# Step 3: Check AWS credentials
echo -e "${YELLOW}Step 2: Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo -e "${RED}Error: AWS credentials not configured${NC}"
  echo "Please run: aws configure"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

echo -e "${GREEN}✓ AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}✓ AWS Region: ${REGION}${NC}"
echo ""

# Step 4: Check if EC2 key pair exists
echo -e "${YELLOW}Step 3: Checking EC2 key pair...${NC}"
if ! aws ec2 describe-key-pairs --key-names "$EC2_KEY_NAME" > /dev/null 2>&1; then
  echo -e "${RED}Error: EC2 key pair '${EC2_KEY_NAME}' not found${NC}"
  echo ""
  echo "Create it with:"
  echo "  aws ec2 create-key-pair --key-name $EC2_KEY_NAME --query 'KeyMaterial' --output text > ~/.ssh/${EC2_KEY_NAME}.pem"
  echo "  chmod 400 ~/.ssh/${EC2_KEY_NAME}.pem"
  echo ""
  echo "Or set a different key name:"
  echo "  export EC2_KEY_NAME=your-key-name"
  exit 1
fi

echo -e "${GREEN}✓ EC2 key pair '${EC2_KEY_NAME}' found${NC}"
echo ""

# Step 5: Bootstrap CDK (if needed)
echo -e "${YELLOW}Step 4: Checking CDK bootstrap status...${NC}"
if ! aws cloudformation describe-stacks --stack-name CDKToolkit > /dev/null 2>&1; then
  echo -e "${YELLOW}CDK not bootstrapped. Bootstrapping now...${NC}"
  npx cdk bootstrap

  if [ $? -ne 0 ]; then
    echo -e "${RED}CDK bootstrap failed!${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ CDK bootstrapped successfully${NC}"
else
  echo -e "${GREEN}✓ CDK already bootstrapped${NC}"
fi
echo ""

# Step 6: Synth the stack
echo -e "${YELLOW}Step 5: Synthesizing CloudFormation template...${NC}"
export EC2_KEY_NAME
export DEPLOY_FROM_DIST
npx cdk synth

if [ $? -ne 0 ]; then
  echo -e "${RED}CDK synth failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Template synthesized successfully${NC}"
echo ""

# Step 7: Deploy
echo -e "${YELLOW}Step 6: Deploying to AWS...${NC}"
echo -e "${YELLOW}This will create:${NC}"
echo "  - VPC with public subnet"
echo "  - EC2 t2.micro instance (free tier)"
echo "  - Security groups"
echo "  - S3 bucket with your application"
echo "  - Elastic IP"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled${NC}"
  exit 0
fi

npx cdk deploy --require-approval never

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed!${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}The outputs above contain:${NC}"
echo "  - Elastic IP (use this for DNS)"
echo "  - SSH command to connect"
echo "  - Application URLs"
echo ""
echo -e "${YELLOW}Note:${NC} It may take a few minutes for the application to start."
echo "The EC2 instance is downloading your app from S3 and starting it with PM2."
echo ""
echo -e "${YELLOW}To check the status:${NC}"
echo "  1. SSH into the instance (use the SSH command from outputs)"
echo "  2. Run: pm2 status"
echo "  3. Check logs: pm2 logs dougust-api"
echo ""
