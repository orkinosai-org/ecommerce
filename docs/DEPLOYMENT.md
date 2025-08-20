# Deployment Guide

This guide covers deployment strategies and configurations for the e-commerce platform.

## 🌐 Deployment Overview

The e-commerce platform can be deployed in various environments:

- **Development**: Local development with Docker Compose
- **Staging**: Cloud-based staging environment for testing
- **Production**: Scalable production deployment

## 🐳 Docker Deployment

### Production Docker Setup

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - DEBUG=0
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - media_files:/app/media
    depends_on:
      - db
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - media_files:/var/www/media
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  celery:
    build:
      context: .
      dockerfile: backend/Dockerfile
    command: celery -A config worker --loglevel=info
    environment:
      - DEBUG=0
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  media_files:
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECR repositories**:
   ```bash
   aws ecr create-repository --repository-name ecommerce-backend
   aws ecr create-repository --repository-name ecommerce-frontend
   ```

2. **Build and push images**:
   ```bash
   # Backend
   docker build -t ecommerce-backend ./backend
   docker tag ecommerce-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecommerce-backend:latest
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecommerce-backend:latest

   # Frontend
   docker build -t ecommerce-frontend ./frontend
   docker tag ecommerce-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecommerce-frontend:latest
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ecommerce-frontend:latest
   ```

3. **Create ECS task definition**:
   ```json
   {
     "family": "ecommerce-task",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "1024",
     "memory": "2048",
     "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/ecommerce-backend:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "postgresql://user:pass@rds-endpoint:5432/ecommerce"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/ecommerce",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

#### Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ecommerce-vpc"
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier     = "ecommerce-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "ecommerce"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
  
  tags = {
    Name = "ecommerce-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "ecommerce-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "ecommerce-redis"
  description                = "Redis cluster for ecommerce"
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  num_cache_clusters         = 1
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name = "ecommerce-redis"
  }
}
```

### Digital Ocean Deployment

#### Using Digital Ocean App Platform

```yaml
# .do/app.yaml
name: ecommerce-platform
services:
- name: backend
  source_dir: backend
  github:
    repo: orkinosai-org/ecommerce
    branch: main
  run_command: gunicorn --worker-tmp-dir /dev/shm config.wsgi:application
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DEBUG
    value: "0"
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.DATABASE_URL}

- name: frontend
  source_dir: frontend
  github:
    repo: orkinosai-org/ecommerce
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: ${backend.PUBLIC_URL}

databases:
- name: db
  engine: PG
  num_nodes: 1
  size: db-s-dev-database

- name: redis
  engine: REDIS
  num_nodes: 1
  size: db-s-dev-database

static_sites:
- name: static-assets
  source_dir: frontend/public
  github:
    repo: orkinosai-org/ecommerce
    branch: main
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Production .env
DEBUG=0
SECRET_KEY=your-super-secret-production-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/ecommerce

# Redis
REDIS_URL=redis://redis-host:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=1
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=your-cloudfront-domain

# Payment
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
SECURE_SSL_REDIRECT=1
SESSION_COOKIE_SECURE=1
CSRF_COOKIE_SECURE=1
SECURE_BROWSER_XSS_FILTER=1
SECURE_CONTENT_TYPE_NOSNIFF=1
```

## 📊 Monitoring & Logging

### Application Monitoring

#### Sentry Integration

```python
# settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[
        DjangoIntegration(auto_enabling=True),
        CeleryIntegration(auto_enabling=True),
    ],
    traces_sample_rate=0.1,
    send_default_pii=True,
    environment="production",
)
```

#### Logging Configuration

```python
# settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/ecommerce.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Infrastructure Monitoring

#### Health Check Endpoints

```python
# backend/apps/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Health check endpoint for load balancers"""
    checks = {
        'database': check_database(),
        'cache': check_cache(),
    }
    
    status = 200 if all(checks.values()) else 503
    
    return JsonResponse({
        'status': 'healthy' if status == 200 else 'unhealthy',
        'checks': checks,
    }, status=status)

def check_database():
    try:
        connection.ensure_connection()
        return True
    except Exception:
        return False

def check_cache():
    try:
        cache.set('health_check', 'ok', 10)
        return cache.get('health_check') == 'ok'
    except Exception:
        return False
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run tests
      run: |
        cd backend
        pytest --cov
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        # Your deployment script here
        echo "Deploying to production..."
```

## 📈 Performance Optimization

### Production Optimizations

#### Django Settings

```python
# settings/production.py

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            }
        }
    }
}

# Session
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database
DATABASES['default']['CONN_MAX_AGE'] = 60
DATABASES['default']['OPTIONS'] = {
    'MAX_CONNS': 20,
    'MIN_CONNS': 5,
}
```

#### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$host$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Admin routes
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🔒 Security Checklist

### Production Security

- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Enable database encryption
- [ ] Configure proper CORS headers
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor for vulnerabilities
- [ ] Implement proper logging

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL | gzip > "backup-$(date +%Y%m%d-%H%M%S).sql.gz"

# Upload to S3
aws s3 cp backup-*.sql.gz s3://your-backup-bucket/

# Clean old backups (keep last 30 days)
find . -name "backup-*.sql.gz" -mtime +30 -delete
```

---

This deployment guide provides a comprehensive overview of deploying the e-commerce platform in various environments. Choose the approach that best fits your infrastructure and scaling requirements.