#!/bin/bash
set -e

# Script to invoke the migration Lambda function
# This can be run manually or as part of a deployment pipeline

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[Invoke Migration] Getting Lambda function name from CloudFormation..."

# Get the Lambda function name from CloudFormation outputs
FUNCTION_NAME=$(cd "$AWS_DIR" && cdk deploy --all --outputs-file outputs.json --require-approval never > /dev/null 2>&1 && \
  cat outputs.json | grep -A1 "MigrationLambdaName" | tail -1 | cut -d'"' -f4)

if [ -z "$FUNCTION_NAME" ]; then
  echo "[Invoke Migration] Error: Could not find migration Lambda function name"
  echo "[Invoke Migration] Make sure the stack is deployed"
  exit 1
fi

echo "[Invoke Migration] Found Lambda function: $FUNCTION_NAME"
echo "[Invoke Migration] Invoking migration Lambda..."

# Invoke the Lambda function
aws lambda invoke \
  --function-name "$FUNCTION_NAME" \
  --cli-binary-format raw-in-base64-out \
  --payload '{}' \
  /tmp/migration-response.json

echo ""
echo "[Invoke Migration] Response:"
cat /tmp/migration-response.json | jq '.'

# Check the status code in the response
STATUS_CODE=$(cat /tmp/migration-response.json | jq -r '.statusCode')

if [ "$STATUS_CODE" == "200" ]; then
  echo ""
  echo "[Invoke Migration] ✓ Migration completed successfully"
  exit 0
else
  echo ""
  echo "[Invoke Migration] ✗ Migration failed"
  exit 1
fi
