# Development Guide

This guide provides detailed information for developers working on the e-commerce platform.

## 🛠️ Development Environment Setup

### Quick Start with Docker

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/orkinosai-org/ecommerce.git
cd ecommerce

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Setup database
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Install frontend dependencies
docker-compose exec frontend npm install
```

### Manual Development Setup

#### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. **Database setup**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic
   ```

5. **Run development server**:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your settings
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
ecommerce/
├── backend/                 # Django backend
│   ├── apps/               # Django applications
│   │   ├── accounts/       # User management
│   │   ├── products/       # Product catalog
│   │   ├── orders/         # Order management
│   │   └── payments/       # Payment processing
│   ├── config/             # Django settings
│   ├── static/             # Static files
│   ├── media/              # User uploads
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Next.js pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── docs/                  # Documentation
├── docker-compose.yml     # Development environment
└── README.md             # Project overview
```

## 🔧 Development Tools

### Code Quality Tools

#### Backend (Python)

```bash
# Format code
black .
isort .

# Lint code
flake8
mypy .

# Run tests
pytest
pytest --cov

# Pre-commit hooks
pre-commit install
pre-commit run --all-files
```

#### Frontend (TypeScript/React)

```bash
# Format code
npm run lint:fix
npx prettier --write .

# Type checking
npm run type-check

# Run tests
npm test
npm run test:coverage
```

### Database Management

#### Migrations

```bash
# Create migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

#### Database Operations

```bash
# Create superuser
python manage.py createsuperuser

# Load sample data
python manage.py loaddata fixtures/sample_data.json

# Create database backup
python manage.py dumpdata > backup.json
```

## 🧪 Testing

### Backend Testing

#### Test Structure

```
backend/tests/
├── test_models.py          # Model tests
├── test_views.py           # View tests
├── test_api.py            # API tests
├── test_utils.py          # Utility tests
└── fixtures/              # Test data
```

#### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_models.py

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test
pytest tests/test_models.py::TestProductModel::test_product_creation
```

#### Writing Tests

```python
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.products.models import Product

User = get_user_model()

class TestProductModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_product_creation(self):
        product = Product.objects.create(
            name='Test Product',
            description='A test product',
            price=29.99,
            created_by=self.user
        )
        
        assert product.name == 'Test Product'
        assert product.price == 29.99
        assert product.created_by == self.user
```

### Frontend Testing

#### Test Structure

```
frontend/src/
├── __tests__/             # Global tests
├── components/
│   └── __tests__/         # Component tests
├── hooks/
│   └── __tests__/         # Hook tests
└── utils/
    └── __tests__/         # Utility tests
```

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Writing Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  image: '/test.jpg',
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ProductCard', () => {
  it('renders product information', () => {
    renderWithProvider(
      <ProductCard product={mockProduct} />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

## 🔄 Development Workflow

### Git Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/new-feature
   ```

### Code Review Process

1. **Self-review**: Review your own code before submitting
2. **Automated checks**: Ensure CI/CD pipeline passes
3. **Peer review**: Get approval from team members
4. **Testing**: Test changes in staging environment

## 🐛 Debugging

### Backend Debugging

#### Django Debug Toolbar

```python
# settings/development.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

#### Logging

```python
import logging

logger = logging.getLogger(__name__)

def my_view(request):
    logger.info(f"Processing request for user: {request.user}")
    logger.debug(f"Request data: {request.data}")
```

### Frontend Debugging

#### React Developer Tools

- Install React Developer Tools browser extension
- Use Components and Profiler tabs for debugging

#### Console Logging

```typescript
// Use appropriate log levels
console.log('Info message');
console.warn('Warning message');
console.error('Error message');

// Debug Redux state
console.log('Current state:', store.getState());
```

## 📊 Performance Optimization

### Backend Optimization

#### Database Queries

```python
# Use select_related for foreign keys
products = Product.objects.select_related('category').all()

# Use prefetch_related for many-to-many
products = Product.objects.prefetch_related('tags').all()

# Use only() to limit fields
products = Product.objects.only('name', 'price').all()
```

#### Caching

```python
from django.core.cache import cache

def get_popular_products():
    key = 'popular_products'
    products = cache.get(key)
    
    if products is None:
        products = Product.objects.filter(
            is_popular=True
        ).select_related('category')
        cache.set(key, products, 300)  # 5 minutes
    
    return products
```

### Frontend Optimization

#### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <p>Loading...</p>,
});
```

#### Image Optimization

```typescript
import Image from 'next/image';

export const ProductImage = ({ src, alt }: Props) => (
  <Image
    src={src}
    alt={alt}
    width={300}
    height={300}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
  />
);
```

## 🔐 Security Considerations

### Backend Security

- Always validate user input
- Use Django's built-in CSRF protection
- Implement proper authentication and authorization
- Keep dependencies updated
- Use HTTPS in production

### Frontend Security

- Sanitize user input
- Use environment variables for sensitive data
- Implement proper CORS configuration
- Validate data on both client and server

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Happy coding! 🚀