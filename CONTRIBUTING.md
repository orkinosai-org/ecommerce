# Contributing to E-Commerce Platform

Thank you for your interest in contributing to our e-commerce platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Testing Guidelines](#testing-guidelines)

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Development Environment Setup

1. **Prerequisites**
   - Node.js v18 or higher
   - PostgreSQL 12+
   - Redis 6+
   - Git
   - Your favorite code editor (VS Code recommended)

2. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/YOUR-USERNAME/ecommerce.git
   cd ecommerce
   
   # Add upstream remote
   git remote add upstream https://github.com/orkinosai-org/ecommerce.git
   ```

3. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or install individually
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Configure your local environment variables
   ```

5. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed development data
   npm run db:seed:dev
   ```

## 🔄 Development Process

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/`: New features (`feature/user-authentication`)
- `bugfix/`: Bug fixes (`bugfix/checkout-validation`)
- `hotfix/`: Critical production fixes (`hotfix/security-patch`)

### Workflow
1. **Create a Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

4. **Keep Your Branch Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add OAuth2 login integration
fix(cart): resolve quantity update bug
docs(api): update authentication endpoints
test(user): add user registration tests
```

## 📝 Coding Standards

### JavaScript/TypeScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write self-documenting code with comments where necessary

```typescript
// Good
const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Bad
const calc = (x: any[]): any => {
  return x.reduce((a, b) => a + (b.p * b.q), 0);
};
```

### React Components
- Use functional components with hooks
- Follow the single responsibility principle
- Use TypeScript interfaces for props
- Implement proper error boundaries

```tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Component implementation
};
```

### Backend Code
- Use Express.js middleware pattern
- Implement proper error handling
- Use async/await instead of callbacks
- Follow RESTful API conventions

```typescript
// Route handler example
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};
```

### Database
- Use migrations for schema changes
- Write efficient queries
- Implement proper indexing
- Use transactions for complex operations

### File Organization
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API service functions
├── stores/             # State management
└── styles/             # Global styles and themes
```

## 🔍 Pull Request Process

### Before Submitting
- [ ] Code follows project standards
- [ ] All tests pass locally
- [ ] New tests written for new functionality
- [ ] Documentation updated
- [ ] No console.log statements left in code
- [ ] Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
```

### Review Process
1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing for significant changes
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge to main

## 🐛 Issue Reporting

### Bug Reports
Use our bug report template and include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

### Feature Requests
Include:
- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: Describe your solution
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

## 🧪 Testing Guidelines

### Test Structure
```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── e2e/               # End-to-end tests
└── fixtures/          # Test data and mocks
```

### Testing Requirements
- **Unit Tests**: For all utility functions and services
- **Component Tests**: For React components
- **Integration Tests**: For API endpoints
- **E2E Tests**: For critical user flows

### Running Tests
```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests
```typescript
// Example unit test
describe('calculateTotalPrice', () => {
  it('should calculate total price correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ];
    expect(calculateTotalPrice(items)).toBe(25);
  });
});
```

## 🎯 Performance Guidelines

### Frontend Performance
- Implement code splitting and lazy loading
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper caching strategies

### Backend Performance
- Use database indexing
- Implement query optimization
- Use caching for frequent requests
- Monitor API response times

## 🔒 Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines
- Use HTTPS in production

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Write clear README files for modules
- Keep documentation up to date

### API Documentation
- Use OpenAPI/Swagger for API docs
- Include request/response examples
- Document error codes and messages

## 🆘 Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask specific questions in PR comments

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special recognition for long-term contributors

Thank you for contributing to the E-Commerce Platform! 🚀