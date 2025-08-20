import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '5000', 10),

  // Database
  databaseUrl:
    process.env['DATABASE_URL'] || 'postgresql://username:password@localhost:5432/ecommerce',

  // Redis
  redisUrl: process.env['REDIS_URL'] || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
  jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',

  // External Services
  stripeSecretKey: process.env['STRIPE_SECRET_KEY'],
  stripeWebhookSecret: process.env['STRIPE_WEBHOOK_SECRET'],

  // Email
  smtpHost: process.env['SMTP_HOST'],
  smtpPort: parseInt(process.env['SMTP_PORT'] || '587', 10),
  smtpUser: process.env['SMTP_USER'],
  smtpPass: process.env['SMTP_PASS'],

  // AWS
  awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'],
  awsSecretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
  awsRegion: process.env['AWS_REGION'] || 'us-east-1',
  awsS3Bucket: process.env['AWS_S3_BUCKET'],

  // App Configuration
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  backendUrl: process.env['BACKEND_URL'] || 'http://localhost:5000',
};
