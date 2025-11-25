# AWS Cloud Deployment Plan

This document outlines the architecture and deployment strategy for deploying the Dougust NestJS backend application to AWS using ECS (Elastic Container Service) with RDS PostgreSQL, all managed through AWS CDK.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                     VPC                             │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │  Public      │         │  Public      │        │    │
│  │  │  Subnet AZ-A │         │  Subnet AZ-B │        │    │
│  │  │              │         │              │        │    │
│  │  │  ┌────────┐  │         │  ┌────────┐  │        │    │
│  │  │  │  ALB   │◄─┼─────────┼─►│  ALB   │  │        │    │
│  │  │  └────┬───┘  │         │  └────┬───┘  │        │    │
│  │  └───────┼──────┘         └───────┼──────┘        │    │
│  │          │                        │               │    │
│  │  ┌───────▼──────┐         ┌───────▼──────┐        │    │
│  │  │  Private     │         │  Private     │        │    │
│  │  │  Subnet AZ-A │         │  Subnet AZ-B │        │    │
│  │  │              │         │              │        │    │
│  │  │  ┌────────┐  │         │  ┌────────┐  │        │    │
│  │  │  │ ECS    │  │         │  │ ECS    │  │        │    │
│  │  │  │ Task   │  │         │  │ Task   │  │        │    │
│  │  │  └────┬───┘  │         │  └────┬───┘  │        │    │
│  │  └───────┼──────┘         └───────┼──────┘        │    │
│  │          │                        │               │    │
│  │  ┌───────▼──────────────────────────────┐        │    │
│  │  │        Private Subnet (DB)           │        │    │
│  │  │                                      │        │    │
│  │  │  ┌──────────────────────────┐        │        │    │
│  │  │  │   RDS PostgreSQL          │        │        │    │
│  │  │  │   (Multi-AZ)              │        │        │    │
│  │  │  └──────────────────────────┘        │        │    │
│  │  └──────────────────────────────────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Supporting Services                    │    │
│  │                                                     │    │
│  │  • ECR (Docker Registry)                            │    │
│  │  • Secrets Manager (DB credentials, JWT secrets)    │    │
│  │  • CloudWatch (Logs & Monitoring)                   │    │
│  │  • Route 53 (DNS - Optional)                        │    │
│  │  • ACM (SSL Certificates - Optional)                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure Components

### 1. Network Layer (VPC)
- **VPC**: Dedicated VPC with CIDR block (e.g., 10.0.0.0/16)
- **Public Subnets**: 2 subnets across 2 AZs for Application Load Balancer
- **Private Subnets**: 2 subnets across 2 AZs for ECS tasks
- **Database Subnets**: 2 isolated subnets across 2 AZs for RDS
- **NAT Gateways**: For outbound internet access from private subnets
- **Internet Gateway**: For public subnet internet access

### 2. Database Layer (RDS PostgreSQL)
- **Engine**: PostgreSQL 15.x or later
- **Deployment**: Multi-AZ deployment for high availability
- **Instance Type**: Start with db.t3.medium (adjustable based on load)
- **Storage**: 100GB gp3 storage with auto-scaling enabled
- **Backup**: Automated backups with 7-day retention
- **Security**: Database credentials stored in AWS Secrets Manager
- **Subnet Group**: Deployed in private database subnets
- **Security Group**: Only accessible from ECS tasks

### 3. Compute Layer (ECS Fargate)
- **Cluster**: ECS cluster for running containerized application
- **Launch Type**: Fargate (serverless containers)
- **Task Definition**:
  - CPU: 512 (0.5 vCPU) - adjustable
  - Memory: 1024MB (1GB) - adjustable
  - Container Port: 3000
  - Environment Variables: Non-sensitive config
  - Secrets: JWT secrets, database URL from Secrets Manager
- **Service**:
  - Desired Count: 2 (for high availability)
  - Auto-scaling: CPU/Memory based scaling (min: 2, max: 10)
  - Health Check: HTTP GET /api/health
  - Deployment: Rolling updates with circuit breaker

### 4. Load Balancing (ALB)
- **Type**: Application Load Balancer
- **Scheme**: Internet-facing
- **Listeners**:
  - HTTP (80) - redirect to HTTPS
  - HTTPS (443) - for production with SSL certificate
- **Target Group**: ECS tasks on port 3000
- **Health Check**: /api/health endpoint
- **Stickiness**: Enabled for session management

### 5. Container Registry (ECR)
- **Repository**: Private repository for Docker images
- **Lifecycle Policy**: Keep last 10 images, delete untagged after 7 days
- **Scan on Push**: Enabled for vulnerability scanning

### 6. Secrets Management
- **Secrets Manager** stores:
  - `prod/dougust/database-url`: PostgreSQL connection string
  - `prod/dougust/jwt-secret`: JWT access token secret
  - `prod/dougust/jwt-refresh-secret`: JWT refresh token secret

### 7. Monitoring & Logging
- **CloudWatch Logs**: Application and container logs
- **CloudWatch Metrics**: CPU, Memory, Request count
- **CloudWatch Alarms**:
  - High CPU/Memory usage
  - Database connection issues
  - Application errors
- **Container Insights**: Enabled for detailed metrics

## Project Structure

```
infra/
└── backend/
    ├── package.json                 # CDK dependencies
    ├── tsconfig.json               # TypeScript config
    ├── cdk.json                    # CDK configuration
    ├── bin/
    │   └── backend-stack.ts        # CDK app entry point
    ├── lib/
    │   ├── network-stack.ts        # VPC, Subnets, NAT
    │   ├── database-stack.ts       # RDS PostgreSQL
    │   ├── secrets-stack.ts        # Secrets Manager
    │   ├── ecr-stack.ts            # Container Registry
    │   ├── ecs-stack.ts            # ECS Cluster, Service, Tasks
    │   ├── monitoring-stack.ts     # CloudWatch, Alarms
    │   └── pipeline-stack.ts       # CI/CD Pipeline (optional)
    └── README.md                   # Infrastructure documentation
```

## Environment Variables

### Required Secrets (Secrets Manager)
- `DATABASE_URL`: PostgreSQL connection string (auto-generated from RDS)
- `JWT_SECRET`: JWT access token secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret

### Environment Variables (ECS Task)
- `NODE_ENV`: production
- `PORT`: 3000
- `JWT_ACCESS_TOKEN_TTL`: 15m (or as configured)
- `JWT_REFRESH_TOKEN_TTL`: 30d (or as configured)
- `TENANT_ID`: Configuration for multi-tenancy
- `NEXT_PUBLIC_API_URL`: Public API URL (ALB DNS)

## CI/CD Pipeline (GitHub Actions)

### Workflow Overview
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Push to   │────►│  Build &     │────►│  Push to    │────►│  Deploy to   │
│   main      │     │  Test        │     │  ECR        │     │  ECS         │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

### Pipeline Stages

1. **Build & Test**
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Run linting
   - Run tests
   - Build application

2. **Docker Build & Push**
   - Build Docker image
   - Tag with commit SHA and 'latest'
   - Push to ECR

3. **Deploy to ECS**
   - Update task definition with new image
   - Deploy to ECS service
   - Wait for service stability
   - Run smoke tests

### Required GitHub Secrets
- `AWS_ACCOUNT_ID`: AWS account ID
- `AWS_REGION`: Deployment region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: IAM access key for deployment
- `AWS_SECRET_ACCESS_KEY`: IAM secret key for deployment
- `ECR_REPOSITORY`: ECR repository name

## Implementation Steps

### Phase 1: Infrastructure Setup (Week 1)

1. **Create CDK Project**
   ```bash
   mkdir -p infra/backend
   cd infra/backend
   npm init -y
   npm install -D aws-cdk aws-cdk-lib constructs typescript @types/node
   npx cdk init app --language typescript
   ```

2. **Implement Infrastructure Stacks**
   - Network Stack (VPC, Subnets, NAT Gateway)
   - Secrets Stack (Create secrets for DB and JWT)
   - Database Stack (RDS PostgreSQL with Multi-AZ)
   - ECR Stack (Container registry)
   - ECS Stack (Cluster, Task Definition, Service, ALB)
   - Monitoring Stack (CloudWatch dashboards and alarms)

3. **Bootstrap CDK**
   ```bash
   npx cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

4. **Deploy Infrastructure**
   ```bash
   npx cdk deploy --all
   ```

### Phase 2: Application Containerization (Week 1)

1. **Create Dockerfile**
   - Multi-stage build for optimization
   - Use node:18-alpine base image
   - Copy dist folder from NX build
   - Install production dependencies only
   - Health check endpoint

2. **Create .dockerignore**
   - Exclude node_modules, .git, tests, etc.

3. **Local Testing**
   ```bash
   docker build -t dougust-be:local .
   docker run -p 3000:3000 --env-file .env.local dougust-be:local
   ```

### Phase 3: CI/CD Pipeline Setup (Week 2)

1. **Create GitHub Actions Workflow**
   - `.github/workflows/deploy-backend.yml`
   - Trigger on push to main branch
   - Build, test, and deploy stages

2. **Configure AWS Credentials**
   - Create IAM user for GitHub Actions
   - Grant necessary permissions (ECR, ECS, Secrets Manager)
   - Add secrets to GitHub repository

3. **Test Deployment**
   - Make a test commit to trigger pipeline
   - Monitor deployment in GitHub Actions
   - Verify ECS service is running
   - Test API endpoints via ALB DNS

### Phase 4: Production Hardening (Week 2)

1. **Security**
   - Enable encryption at rest for RDS
   - Configure security groups with least privilege
   - Enable AWS WAF on ALB (optional)
   - Implement VPC Flow Logs

2. **Monitoring**
   - Set up CloudWatch dashboards
   - Configure alarms for critical metrics
   - Set up SNS for alert notifications
   - Enable Container Insights

3. **Backup & Recovery**
   - Configure automated RDS snapshots
   - Document disaster recovery procedures
   - Test restore procedures

4. **Performance**
   - Configure auto-scaling policies
   - Set up CloudFront CDN (optional)
   - Enable ALB access logs

5. **Domain & SSL (Optional)**
   - Register domain in Route 53
   - Create SSL certificate in ACM
   - Configure ALB with HTTPS listener
   - Update DNS records

## Cost Estimation (Monthly)

### Development Environment
- **ECS Fargate** (2 tasks, 0.5 vCPU, 1GB): ~$30
- **RDS PostgreSQL** (db.t3.medium, Multi-AZ): ~$120
- **Application Load Balancer**: ~$20
- **NAT Gateway** (2 AZs): ~$60
- **Data Transfer**: ~$10
- **CloudWatch**: ~$10
- **Total**: ~$250/month

### Production Environment
- **ECS Fargate** (4 tasks, 1 vCPU, 2GB): ~$120
- **RDS PostgreSQL** (db.t3.large, Multi-AZ): ~$240
- **Application Load Balancer**: ~$20
- **NAT Gateway** (2 AZs): ~$60
- **Data Transfer**: ~$50
- **CloudWatch**: ~$20
- **Total**: ~$510/month

*Note: Actual costs will vary based on usage, data transfer, and scaling*

## Scaling Strategy

### Horizontal Scaling (ECS Tasks)
- **Metrics**: CPU > 70% or Memory > 80%
- **Scale Up**: Add 1 task (max 10 tasks)
- **Scale Down**: Remove 1 task (min 2 tasks)
- **Cooldown**: 300 seconds

### Vertical Scaling (RDS)
- Monitor database performance metrics
- Upgrade instance type as needed
- Enable read replicas for read-heavy workloads

### Database Connection Pooling
- Configure Drizzle connection pool size
- Recommended: 10-20 connections per ECS task

## Security Best Practices

1. **Network Security**
   - Use private subnets for ECS and RDS
   - Security groups with least privilege
   - No direct database access from internet

2. **Secrets Management**
   - Never hardcode credentials
   - Use Secrets Manager for all sensitive data
   - Rotate secrets regularly

3. **Container Security**
   - Scan images for vulnerabilities
   - Use minimal base images (Alpine)
   - Run as non-root user

4. **Access Control**
   - Use IAM roles for ECS tasks
   - Enable CloudTrail for audit logging
   - Implement MFA for AWS console access

5. **Data Protection**
   - Enable encryption at rest and in transit
   - Regular automated backups
   - Implement database access logging

## Monitoring & Alerting

### Key Metrics to Monitor
1. **Application Metrics**
   - Request rate and latency
   - Error rates (4xx, 5xx)
   - Task count and health

2. **Database Metrics**
   - CPU and memory utilization
   - Connection count
   - Query performance
   - Storage usage

3. **Infrastructure Metrics**
   - ECS service health
   - ALB healthy target count
   - NAT Gateway throughput

### Recommended Alarms
- ECS Service: Unhealthy task count > 0
- RDS: CPU > 80% for 5 minutes
- RDS: Storage < 20% free
- ALB: 5xx errors > 10 in 5 minutes
- ALB: Healthy targets < 1

## Disaster Recovery

### Backup Strategy
- **RDS Automated Backups**: Daily, 7-day retention
- **RDS Manual Snapshots**: Before major deployments
- **Database Export**: Weekly full backup to S3

### Recovery Procedures
1. **Database Failure**
   - Automatic failover to standby (Multi-AZ)
   - RTO: < 2 minutes
   - RPO: < 5 minutes

2. **Application Failure**
   - ECS auto-recovery of failed tasks
   - Rollback to previous ECS task definition
   - RTO: < 5 minutes

3. **Region Failure**
   - Manual failover to backup region (if configured)
   - Restore from latest RDS snapshot
   - RTO: < 1 hour
   - RPO: < 1 hour

## Migration Strategy

### Database Migration
1. **Setup RDS Instance**: Deploy via CDK
2. **Run Migrations**: Use Drizzle migration tools
3. **Seed Data**: Run seed scripts if needed
4. **Verify Schema**: Check all tables and indexes

### Application Migration
1. **Deploy to Staging**: Test full stack in AWS
2. **Load Testing**: Verify performance under load
3. **Blue/Green Deployment**: Deploy to production with rollback plan
4. **DNS Cutover**: Update DNS to point to ALB
5. **Monitor**: Watch metrics for 24-48 hours

## Maintenance Windows

### Recommended Schedule
- **Database Maintenance**: Sunday 2-4 AM (your timezone)
- **Application Updates**: Continuous deployment during business hours
- **Infrastructure Updates**: Planned maintenance windows

## Support & Documentation

### Runbooks
- Deployment procedures
- Rollback procedures
- Scaling procedures
- Incident response

### Access Management
- Document who has access to AWS console
- Document who can approve deployments
- Document on-call rotation

## Next Steps

1. Review and approve this architecture plan
2. Set up AWS account and IAM users
3. Create `infra/backend` CDK project
4. Implement infrastructure stacks
5. Create Dockerfile for NestJS application
6. Set up GitHub Actions workflow
7. Deploy to development environment
8. Test and validate
9. Deploy to production

## References

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
