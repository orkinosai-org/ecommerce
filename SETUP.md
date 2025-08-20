# Development Setup Guide

This guide will help you set up the E-Commerce Platform development environment.

## Prerequisites

- Node.js v18.17.0 (use `.nvmrc` for version management)
- npm v9.0.0 or higher
- Git
- Docker (optional, for containerized development)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/orkinosai-org/ecommerce.git
   cd ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit the .env files with your actual values
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

## Project Structure

This is a monorepo using npm workspaces with the following structure:

```
ecommerce/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types and utilities
├── scripts/           # Build and utility scripts
├── infrastructure/    # Docker configurations
└── .github/          # GitHub workflows and templates
```

## Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code using Prettier
- `npm run install:all` - Install dependencies for all workspaces

### Package-Specific Scripts
Navigate to `frontend/`, `backend/`, or `shared/` and run:
- `npm run dev` - Start in development mode
- `npm run build` - Build the package
- `npm run test` - Run tests
- `npm run lint` - Lint the package

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Ensure code quality: `npm run lint && npm run format:check`
4. Run tests: `npm run test`
5. Build to verify: `npm run build`
6. Commit your changes (pre-commit hooks will run automatically)
7. Push and create a pull request

## Docker Development (Optional)

You can use Docker for a consistent development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Code Quality

This project enforces code quality through:

- **ESLint** for linting JavaScript/TypeScript
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **lint-staged** for staged file linting
- **TypeScript** for type safety

## CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **CI**: Linting, testing, and building on pull requests
- **Security**: Security scanning and dependency auditing
- **Deploy**: Automated deployment on main branch

## Troubleshooting

### Common Issues

1. **Node version mismatch**: Use `nvm use` to switch to the correct Node.js version
2. **Dependencies issues**: Run `npm run install:all` to reinstall all dependencies
3. **Build failures**: Ensure all environment variables are set correctly
4. **Port conflicts**: Make sure ports 3000 and 5000 are available

### Getting Help

- Check the [Contributing Guide](CONTRIBUTING.md)
- Review the [Architecture Documentation](ARCHITECTURE.md)
- Browse the [project documentation](docs/)
- Open an issue on GitHub for bugs or feature requests

## Next Steps

After setting up the development environment:

1. Review the [Architecture Documentation](ARCHITECTURE.md)
2. Read the [Contributing Guidelines](CONTRIBUTING.md)
3. Explore the [API Documentation](docs/api.md)
4. Check out the [Security Guidelines](docs/security.md)
5. Start contributing to the project!