#!/bin/bash
# Wrapper to test be-userdata.sh locally in Docker
# This replaces the CDK placeholders and runs the actual EC2 user data script

set -e

echo "Preparing be-userdata.sh for local testing..."

# Create a test version with placeholders replaced
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_SCRIPT="/tmp/userdata-test.sh"

# Replace placeholders (simulating what CDK does)
cat "$SCRIPT_DIR/be-userdata.sh" | \
  sed 's|aws s3 sync s3://{{BUCKET_NAME}}/app/ /home/ec2-user/app/|# S3 sync skipped - app mounted via Docker volume|g' | \
  sed 's|{{ENV_FILE_CONTENT}}|NODE_ENV=production\nPORT=3000|g' \
  > "$TEMP_SCRIPT"

chmod +x "$TEMP_SCRIPT"

echo "Starting Docker container with Amazon Linux 2023..."
echo "App will be available at:"
echo "  - Direct: http://localhost:3000"
echo "  - Nginx:  http://localhost:8080"
echo ""

docker run -it --rm \
  --privileged \
  --name dougust-ec2-test \
  -p 3000:3000 \
  -p 8080:80 \
  -v "$(cd $SCRIPT_DIR/../.. && pwd)/dist:/home/ec2-user/app:ro" \
  -v "$TEMP_SCRIPT:/userdata.sh:ro" \
  public.ecr.aws/amazonlinux/amazonlinux:2023 \
  /bin/bash -c "/userdata.sh && echo 'Setup complete! Press Ctrl+C to exit.' && tail -f /var/log/user-data.log"
