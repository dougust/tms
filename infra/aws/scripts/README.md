# EC2 User Data Scripts

This directory contains modular shell scripts that are executed when the EC2 instance boots for the first time.

## Scripts

### 1. setup-instance.sh
**Purpose**: Base system setup and dependencies installation

**What it does**:
- Updates system packages (`yum update`)
- Installs Node.js 20.x LTS
- Installs PM2 process manager globally
- Creates application directory at `/home/ec2-user/app`

**When to modify**:
- Change Node.js version
- Add additional system dependencies
- Modify installation paths

---

### 2. deploy-app.sh
**Purpose**: Downloads and starts the NestJS application

**What it does**:
- Downloads application from S3 bucket
- Installs production dependencies (`npm ci --production`)
- Creates `.env` file with environment variables
- Sets correct file ownership
- Starts application with PM2
- Configures PM2 to auto-start on system boot

**Template Variables** (replaced by CDK at build time):
- `{{BUCKET_NAME}}` - The S3 bucket name containing your application
- `{{ENV_FILE_CONTENT}}` - Environment variables (from `bin/dougust.ts`)

**When to modify**:
- Change PM2 startup configuration
- Modify application startup command
- Add database migrations or other pre-start scripts

**Example customization**:
```bash
# Run migrations before starting
cd /home/ec2-user/app
npm run migrate:deploy

# Then start app
pm2 start main.js --name dougust-api
```

---

### 3. setup-nginx.sh
**Purpose**: Configures Nginx as a reverse proxy

**What it does**:
- Installs Nginx
- Creates configuration file at `/etc/nginx/conf.d/dougust.conf`
- Configures proxy from port 80 to port 3000
- Enables WebSocket support
- Starts and enables Nginx service

**When to modify**:
- Add SSL/HTTPS configuration
- Change proxy settings
- Add caching rules
- Configure rate limiting
- Add custom headers

**Example customization for SSL**:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... rest of proxy settings
    }
}
```

---

## How It Works

1. **CDK Synthesis Time**:
   - CDK reads all `.sh` files from this directory
   - Replaces template variables in `deploy-app.sh`
   - Combines all scripts into one user data script
   - Adds logging and error handling

2. **EC2 Boot Time**:
   - Scripts execute in order:
     1. `setup-instance.sh`
     2. `deploy-app.sh`
     3. `setup-nginx.sh`
   - All output is logged to `/var/log/user-data.log`
   - Completion marker created at `/home/ec2-user/setup-complete.txt`

## Debugging

### View deployment logs
```bash
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
sudo tail -f /var/log/user-data.log
```

### Check if setup completed
```bash
ssh -i ~/.ssh/dougust-key.pem ec2-user@<ELASTIC_IP>
cat /home/ec2-user/setup-complete.txt
```

### View CloudWatch logs
The user data output is also sent to `/var/log/cloud-init-output.log`

## Best Practices

1. **Keep scripts modular**: Each script should handle one concern
2. **Use `set -e`**: Scripts fail fast on any error
3. **Add logging**: Echo messages to indicate progress
4. **Test locally**: You can test scripts in a Docker container with Amazon Linux 2023
5. **Version control**: These scripts are part of your infrastructure as code

## Adding New Scripts

To add a new script to the deployment:

1. Create `scripts/your-script.sh`
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Update `lib/dougust-stack.ts` to read and include it:

```typescript
const yourScript = readFileSync(
  join(scriptsPath, 'your-script.sh'),
  'utf-8'
);

// Add to fullScript array
const fullScript = [
  // ... existing scripts
  yourScript,
  // ...
].join('\n');
```

## Template Variables

To add template variables to any script:

1. Use `{{VARIABLE_NAME}}` placeholder in your script
2. Replace it in the CDK stack:

```typescript
const yourScript = readFileSync(
  join(scriptsPath, 'your-script.sh'),
  'utf-8'
).replace('{{VARIABLE_NAME}}', actualValue);
```

## Common Modifications

### Change Node.js Version
Edit `setup-instance.sh`:
```bash
# Install Node.js 18.x instead of 20.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
```

### Add Database Connection Check
Edit `deploy-app.sh` to add health check before starting:
```bash
# Wait for database to be ready
until nc -z $DB_HOST $DB_PORT; do
  echo "Waiting for database..."
  sleep 2
done

# Then start app
pm2 start main.js --name dougust-api
```

### Enable HTTPS with Let's Encrypt
Edit `setup-nginx.sh` to install certbot:
```bash
# Install certbot
dnf install -y certbot python3-certbot-nginx

# Get certificate (requires domain pointing to this server)
certbot --nginx -d yourdomain.com --non-interactive --agree-tos -m your@email.com
```
