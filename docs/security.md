# Security Guidelines

This document outlines security best practices and requirements for the
E-Commerce Platform.

## 🔒 Security Overview

Security is a critical aspect of any e-commerce platform. This document covers
security measures across all layers of the application, from frontend to
database, and includes guidelines for secure development practices.

## 🛡️ Authentication & Authorization

### JWT Token Security

```typescript
// Token configuration
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'ecommerce-platform',
    audience: 'ecommerce-users',
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'HS256',
  },
};

// Secure token generation
const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
      issuer: JWT_CONFIG.accessToken.issuer,
      audience: JWT_CONFIG.accessToken.audience,
    }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: JWT_CONFIG.refreshToken.expiresIn }
  );

  return { accessToken, refreshToken };
};
```

### Role-Based Access Control (RBAC)

```typescript
enum Permission {
  READ_PRODUCTS = 'products:read',
  WRITE_PRODUCTS = 'products:write',
  READ_ORDERS = 'orders:read',
  WRITE_ORDERS = 'orders:write',
  READ_USERS = 'users:read',
  WRITE_USERS = 'users:write',
}

interface Role {
  name: string;
  permissions: Permission[];
}

const ROLES: Record<string, Role> = {
  customer: {
    name: 'customer',
    permissions: [
      Permission.READ_PRODUCTS,
      Permission.READ_ORDERS, // Only own orders
    ],
  },
  admin: {
    name: 'admin',
    permissions: Object.values(Permission),
  },
};

// Permission middleware
const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = ROLES[req.user.role];

    if (!userRole || !userRole.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};
```

### Multi-Factor Authentication (MFA)

```typescript
// TOTP implementation
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class MFAService {
  generateSecret(userEmail: string) {
    return speakeasy.generateSecret({
      name: userEmail,
      issuer: 'E-Commerce Platform',
      length: 32,
    });
  }

  async generateQRCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after
    });
  }
}
```

## 🔐 Password Security

### Password Hashing

```typescript
import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';

class PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    // Validate password strength
    const strength = zxcvbn(password);
    if (strength.score < 3) {
      throw new Error('Password is too weak');
    }

    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordRequirements(password: string): boolean {
    const requirements = [
      /.{8,}/, // At least 8 characters
      /[a-z]/, // Lowercase letter
      /[A-Z]/, // Uppercase letter
      /\d/, // Number
      /[!@#$%^&*(),.?":{}|<>]/, // Special character
    ];

    return requirements.every((req) => req.test(password));
  }
}
```

### Account Lockout Protection

```typescript
class AccountSecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  async checkAccountLockout(userId: string): Promise<boolean> {
    const attempts = await this.redis.get(`login_attempts:${userId}`);
    const lockoutTime = await this.redis.get(`lockout:${userId}`);

    if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
      return true; // Account is locked
    }

    return false;
  }

  async recordFailedLogin(userId: string): Promise<void> {
    const attempts = await this.redis.incr(`login_attempts:${userId}`);
    await this.redis.expire(`login_attempts:${userId}`, 3600); // 1 hour

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
      await this.redis.set(`lockout:${userId}`, lockoutUntil.toString());
      await this.redis.expire(
        `lockout:${userId}`,
        this.LOCKOUT_DURATION / 1000
      );
    }
  }

  async clearFailedAttempts(userId: string): Promise<void> {
    await this.redis.del(`login_attempts:${userId}`);
    await this.redis.del(`lockout:${userId}`);
  }
}
```

## 🌐 Web Security Headers

### Security Middleware

```typescript
import helmet from 'helmet';

app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com'],
        frameSrc: ['https://js.stripe.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // Prevent clickjacking
    frameguard: {
      action: 'deny',
    },

    // Prevent MIME type sniffing
    noSniff: true,

    // XSS Protection
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://ecommerce-platform.com',
      'https://admin.ecommerce-platform.com',
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
```

## 🛡️ Input Validation & Sanitization

### Request Validation

```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Validation schemas
const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .transform((val) => DOMPurify.sanitize(val)),

  description: z
    .string()
    .max(2000, 'Description too long')
    .transform((val) => DOMPurify.sanitize(val)),

  price: z
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),

  email: z
    .string()
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
});

// SQL Injection Prevention
class DatabaseService {
  async getUserByEmail(email: string): Promise<User | null> {
    // Using parameterized queries with Prisma
    return this.prisma.user.findUnique({
      where: { email }, // Prisma automatically prevents SQL injection
    });
  }

  // Raw query example (if needed)
  async customQuery(userId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM users 
      WHERE id = ${userId} 
      AND active = true
    `;
  }
}
```

### File Upload Security

```typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});
```

## 💳 Payment Security

### PCI DSS Compliance

```typescript
// Never store sensitive payment data
interface PaymentData {
  // Store only non-sensitive data
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;

  // Store payment provider references
  stripePaymentMethodId: string;
  stripeCustomerId: string;
}

class PaymentService {
  async processPayment(amount: number, paymentMethodId: string) {
    try {
      // Use Stripe's secure API
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/return`,
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      logger.error('Payment processing failed', { error });
      throw new Error('Payment processing failed');
    }
  }
}
```

### Webhook Security

```typescript
import crypto from 'crypto';

class WebhookService {
  verifyStripeWebhook(payload: string, signature: string): boolean {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      const elements = signature.split(',');
      const signatureElements = elements.reduce(
        (acc, element) => {
          const [key, value] = element.split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );

      const timestamp = signatureElements.t;
      const expectedSignature = crypto
        .createHmac('sha256', endpointSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signatureElements.v1 || '')
      );
    } catch (error) {
      return false;
    }
  }
}
```

## 🔍 Security Monitoring

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Different limits for different endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests',
});

// Apply to specific routes
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

### Security Logging

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
    }),
  ],
});

// Log security events
const logSecurityEvent = (event: string, details: any, req: Request) => {
  securityLogger.warn('Security Event', {
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
};

// Usage examples
logSecurityEvent('FAILED_LOGIN', { email: 'user@example.com' }, req);
logSecurityEvent(
  'SUSPICIOUS_ACTIVITY',
  { reason: 'Multiple failed attempts' },
  req
);
```

## 🔒 Data Protection

### Encryption at Rest

```typescript
import crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('ecommerce-platform'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('ecommerce-platform'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Personal Data Handling (GDPR)

```typescript
class DataPrivacyService {
  async anonymizeUser(userId: string): Promise<void> {
    const anonymizedEmail = `deleted-${Date.now()}@example.com`;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        addresses: {
          deleteMany: {},
        },
      },
    });

    // Keep order history but anonymize personal data
    await this.prisma.order.updateMany({
      where: { userId },
      data: {
        shippingAddress: {
          street: 'ANONYMIZED',
          city: 'ANONYMIZED',
          state: 'XX',
          zipCode: '00000',
          country: 'XX',
        },
      },
    });
  }

  async exportUserData(userId: string): Promise<any> {
    return {
      user: await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: true,
          orders: {
            include: {
              items: true,
            },
          },
        },
      }),
      exportDate: new Date().toISOString(),
      format: 'JSON',
    };
  }
}
```

## 🚨 Incident Response

### Security Monitoring Alerts

```typescript
class SecurityMonitor {
  async checkSuspiciousActivity(userId: string, action: string): Promise<void> {
    const key = `activity:${userId}:${action}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, 3600); // 1 hour window

    // Alert thresholds
    const thresholds = {
      failed_login: 5,
      password_reset: 3,
      profile_update: 10,
    };

    if (count >= (thresholds[action] || 50)) {
      await this.triggerSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        userId,
        action,
        count,
        timestamp: new Date(),
      });
    }
  }

  private async triggerSecurityAlert(alert: any): Promise<void> {
    // Send to security team
    await this.notificationService.sendSecurityAlert(alert);

    // Log to security system
    securityLogger.error('Security Alert', alert);

    // Auto-response actions
    if (alert.type === 'SUSPICIOUS_ACTIVITY' && alert.count > 10) {
      await this.temporarilyLockAccount(alert.userId);
    }
  }
}
```

## 📋 Security Checklist

### Development

- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection enabled
- [ ] Authentication required for protected routes
- [ ] Authorization checks implemented
- [ ] Sensitive data encrypted
- [ ] Secrets stored securely (not in code)

### Deployment

- [ ] HTTPS enabled with valid certificates
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] File upload restrictions
- [ ] Database access restricted
- [ ] Error messages don't leak information
- [ ] Logging configured for security events
- [ ] Monitoring and alerting setup

### Ongoing

- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing
- [ ] Security training for developers
- [ ] Incident response plan documented
- [ ] Regular backups and recovery testing

## 🔧 Security Tools

### Static Code Analysis

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Dependency Scanning

```bash
# Regular dependency updates
npm audit fix
npm outdated
npm update

# Security-focused tools
npx audit-ci --moderate
npx better-npm-audit audit
```

For security incidents or questions, contact the security team immediately at
security@ecommerce-platform.com.
