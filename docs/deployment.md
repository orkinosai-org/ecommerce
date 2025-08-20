# Deployment Guide

This guide covers deployment strategies and configurations for the E-Commerce
Platform across different environments.

## 🌍 Environment Overview

### Development

- **Purpose**: Local development and testing
- **URL**: http://localhost:3000
- **Database**: Local PostgreSQL
- **Cache**: Local Redis
- **Features**: Hot reload, debug logging, test data

### Staging

- **Purpose**: Pre-production testing and QA
- **URL**: https://staging.ecommerce-platform.com
- **Database**: Managed PostgreSQL (smaller instance)
- **Cache**: Managed Redis
- **Features**: Production-like environment, test payments

### Production

- **Purpose**: Live user-facing application
- **URL**: https://ecommerce-platform.com
- **Database**: Managed PostgreSQL (high availability)
- **Cache**: Redis cluster
- **Features**: Full monitoring, real payments, CDN

## 🐳 Docker Deployment

### Development with Docker Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - '3000:3000'
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:5000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - '5000:5000'
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/ecommerce
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_DB=ecommerce
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Start Development Environment:**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production Docker Images

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 5000
CMD ["npm", "start"]
```

## ☸️ Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce-platform
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
  namespace: ecommerce-platform
data:
  NODE_ENV: 'production'
  API_URL: 'https://api.ecommerce-platform.com'
  FRONTEND_URL: 'https://ecommerce-platform.com'
```

### Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-secrets
  namespace: ecommerce-platform
type: Opaque
stringData:
  DATABASE_URL: 'postgresql://user:password@postgres-service:5432/ecommerce'
  REDIS_URL: 'redis://redis-service:6379'
  JWT_SECRET: 'your-jwt-secret-here'
  STRIPE_SECRET_KEY: 'sk_live_...'
```

### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: ecommerce-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: ecommerce/backend:latest
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: ecommerce-config
                  key: NODE_ENV
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: ecommerce-secrets
                  key: DATABASE_URL
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: ecommerce-secrets
                  key: REDIS_URL
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: ecommerce-platform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: ecommerce/frontend:latest
          ports:
            - containerPort: 3000
          env:
            - name: NEXT_PUBLIC_API_URL
              valueFrom:
                configMapKeyRef:
                  name: ecommerce-config
                  key: API_URL
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

### Services

```yaml
# k8s/services.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: ecommerce-platform
spec:
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 5000
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: ecommerce-platform
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecommerce-ingress
  namespace: ecommerce-platform
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: '100'
spec:
  tls:
    - hosts:
        - ecommerce-platform.com
        - api.ecommerce-platform.com
      secretName: ecommerce-tls
  rules:
    - host: ecommerce-platform.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
    - host: api.ecommerce-platform.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80
```

## ☁️ Cloud Provider Deployments

### AWS Deployment

#### ECS with Fargate

```json
{
  "family": "ecommerce-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/ecommerce-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/ecommerce/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecommerce-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS Configuration

```yaml
# terraform/rds.tf
resource "aws_db_instance" "postgres" { identifier = "ecommerce-postgres"

engine         = "postgres" engine_version = "15.4" instance_class =
"db.t3.micro"

allocated_storage     = 20 max_allocated_storage = 100 storage_type         =
"gp2" storage_encrypted    = true

db_name  = "ecommerce" username = var.db_username password = var.db_password

vpc_security_group_ids = [aws_security_group.rds.id] db_subnet_group_name   =
aws_db_subnet_group.main.name

backup_retention_period = 7 backup_window          = "03:00-04:00"
maintenance_window     = "sun:04:00-sun:05:00"

skip_final_snapshot = false final_snapshot_identifier =
"ecommerce-postgres-final-snapshot"

tags = { Name = "ecommerce-postgres" Environment = var.environment } }
```

### Google Cloud Platform

#### Cloud Run Deployment

```yaml
# cloudrun-backend.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ecommerce-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: '10'
        run.googleapis.com/cpu-throttling: 'false'
    spec:
      containers:
        - image: gcr.io/project-id/ecommerce-backend
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-url
                  key: url
          resources:
            limits:
              cpu: '1000m'
              memory: '1Gi'
```

### Azure Container Instances

```yaml
# azure-container-group.yaml
apiVersion: 2021-03-01
location: eastus
name: ecommerce-platform
properties:
  containers:
    - name: backend
      properties:
        image: yourregistry.azurecr.io/ecommerce-backend:latest
        ports:
          - port: 5000
        environmentVariables:
          - name: NODE_ENV
            value: production
          - name: DATABASE_URL
            secureValue: postgresql://...
        resources:
          requests:
            cpu: 1.0
            memoryInGB: 1.5
    - name: frontend
      properties:
        image: yourregistry.azurecr.io/ecommerce-frontend:latest
        ports:
          - port: 3000
        resources:
          requests:
            cpu: 0.5
            memoryInGB: 1.0
  osType: Linux
  restartPolicy: Always
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping" --health-interval 10s --health-timeout
          5s --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/backend-deployment.yaml
            k8s/frontend-deployment.yaml
            k8s/services.yaml
          images: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
```

## 📊 Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecommerce-backend'
    static_configs:
      - targets: ['backend-service:5000']
    metrics_path: '/metrics'

  - job_name: 'ecommerce-frontend'
    static_configs:
      - targets: ['frontend-service:3000']
    metrics_path: '/metrics'
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "E-Commerce Platform",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔐 Security Considerations

### SSL/TLS Certificate Management

```yaml
# cert-manager certificate
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: ecommerce-tls
  namespace: ecommerce-platform
spec:
  secretName: ecommerce-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - ecommerce-platform.com
    - api.ecommerce-platform.com
```

### Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: ecommerce-platform
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 5000
  egress:
    - to: []
      ports:
        - protocol: TCP
          port: 5432 # PostgreSQL
        - protocol: TCP
          port: 6379 # Redis
```

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Security scan completed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

### Deployment

- [ ] Blue-green deployment strategy
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Cache warmed up
- [ ] CDN cache invalidated

### Post-deployment

- [ ] Application health verified
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing passed
- [ ] Rollback plan ready

## 🔄 Rollback Strategy

### Kubernetes Rollback

```bash
# Check deployment history
kubectl rollout history deployment/backend -n ecommerce-platform

# Rollback to previous version
kubectl rollout undo deployment/backend -n ecommerce-platform

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n ecommerce-platform
```

### Database Rollback

```bash
# Create database backup before deployment
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup if needed
psql $DATABASE_URL < backup_20240120_143000.sql
```

For questions about deployment, please refer to the
[troubleshooting guide](./troubleshooting.md) or contact the DevOps team.
