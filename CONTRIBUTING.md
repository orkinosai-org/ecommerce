# Contributing Guidelines

Thank you for your interest in contributing to our e-commerce platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

We are committed to fostering an open and welcoming environment. Please read and follow our Code of Conduct:

- **Be respectful**: Treat everyone with respect and consideration
- **Be inclusive**: Welcome newcomers and diverse perspectives
- **Be collaborative**: Work together towards common goals
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain professional communication

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Git** knowledge and a GitHub account
- **Python 3.11+** installed
- **Node.js 18+** and npm installed
- **Docker & Docker Compose** for local development
- **Code editor** (VS Code recommended with extensions)

### First Steps

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ecommerce.git
   cd ecommerce
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/orkinosai-org/ecommerce.git
   ```
4. **Set up development environment** (see Development Setup)

## 🛠️ Development Setup

### Using Docker (Recommended)

```bash
# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Run initial setup
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec frontend npm install
```

### Manual Setup

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Environment setup
cp .env.example .env
# Edit .env file with your local settings

# Database setup
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your local settings
```

### Development Tools

#### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.flake8",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 🔄 Contribution Workflow

### 1. Choose an Issue

- Check [existing issues](https://github.com/orkinosai-org/ecommerce/issues)
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- **Features**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`
- **Documentation**: `docs/topic-name`
- **Refactoring**: `refactor/component-name`

### 3. Make Changes

- Follow coding standards (see below)
- Write tests for new functionality
- Update documentation as needed
- Commit frequently with clear messages

### 4. Commit Guidelines

#### Commit Message Format

```
type(scope): brief description

Detailed explanation if needed

Fixes #issue-number
```

#### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples

```bash
feat(products): add product search functionality

Implements full-text search with filters for category,
price range, and availability status.

Fixes #123
```

## 📝 Coding Standards

### Python/Django Standards

#### Code Style

- **Follow PEP 8** style guidelines
- **Use Black** for code formatting
- **Use isort** for import sorting
- **Maximum line length**: 88 characters (Black default)

#### Code Quality Tools

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Format code
black .
isort .

# Lint code
flake8
mypy .

# Run all checks
pre-commit run --all-files
```

#### Django Best Practices

```python
# Good: Use model methods for business logic
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def is_available(self):
        return self.inventory.quantity > 0
    
    def get_discounted_price(self):
        if self.discount:
            return self.price * (1 - self.discount.percentage)
        return self.price

# Good: Use descriptive variable names
def calculate_order_total(order_items, shipping_cost=0, tax_rate=0.08):
    subtotal = sum(item.price * item.quantity for item in order_items)
    tax_amount = subtotal * tax_rate
    return subtotal + shipping_cost + tax_amount
```

### React/TypeScript Standards

#### Code Style

- **Use TypeScript** for all new components
- **Use functional components** with hooks
- **Use Tailwind CSS** for styling
- **Use ESLint and Prettier** for code quality

#### React Best Practices

```typescript
// Good: Type your props
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  className = '',
}) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};
```

## 🧪 Testing Requirements

### Backend Testing

#### Test Structure

```
backend/tests/
├── test_models.py
├── test_views.py
├── test_api.py
└── test_utils.py
```

#### Writing Tests

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class ProductModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_product_creation(self):
        product = Product.objects.create(
            name='Test Product',
            price=29.99,
            created_by=self.user
        )
        self.assertEqual(product.name, 'Test Product')
        self.assertEqual(product.price, 29.99)
```

#### Running Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test tests.test_models

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing

#### Test Structure

```
frontend/src/
├── components/
│   └── __tests__/
├── hooks/
│   └── __tests__/
└── utils/
    └── __tests__/
```

#### Writing Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  image: '/test-image.jpg',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

#### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔍 Pull Request Process

### Before Submitting

1. **Run all tests** and ensure they pass
2. **Run linting tools** and fix any issues
3. **Update documentation** if needed
4. **Rebase on latest main** branch

```bash
git fetch upstream
git rebase upstream/main
```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Fixes #issue-number
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** in staging environment
4. **Final approval** and merge

## 🐛 Issue Reporting

### Bug Reports

Include:

- **Environment details** (OS, browser, versions)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or error messages
- **Console logs** if applicable

### Feature Requests

Include:

- **Problem description** you're trying to solve
- **Proposed solution** or approach
- **Use cases** and user stories
- **Alternative solutions** considered

## 📚 Additional Resources

### Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/DEPLOYMENT.md)

### Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community

- [GitHub Discussions](https://github.com/orkinosai-org/ecommerce/discussions)
- [Issues](https://github.com/orkinosai-org/ecommerce/issues)

## 🎉 Recognition

Contributors will be recognized in:

- **Contributors section** in README
- **Release notes** for significant contributions
- **Hall of Fame** for outstanding contributions

Thank you for contributing to our e-commerce platform! 🚀