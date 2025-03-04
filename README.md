# Prism - Document Management Platform

Prism is a comprehensive document management platform designed to efficiently and securely handle all types of professional documents.

## 🚀 Features

- **Document Management**

  - Real-time collaborative editing
  - Advanced template system
  - Complete versioning and history
  - Granular access control

- **Supported Document Types**

  - Technical documentation
  - Business proposals
  - Specifications
  - Reports and documentation

- **Integrations**
  - GitHub for diagram generation
  - Jira/Trello for project management
  - Public API for third-party extensions

## 🛠 Technologies

- **Backend**

  - Encore.ts (TypeScript)
  - PostgreSQL
  - S3 compatible storage

- **Frontend**
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Shadcn/UI

## 📋 Prerequisites

- Node.js v20+
- PostgreSQL 15+
- Encore CLI

## 🚀 Installation

1. **Install Encore**

```bash
# macOS
brew install encoredev/tap/encore

# Linux
curl -L https://encore.dev/install.sh | bash

# Windows
iwr https://encore.dev/install.ps1 | iex
```

2. **Clone the project**

```bash
git clone [REPO_URL]
cd prism
```

3. **Install dependencies**

```bash
npm install
```

4. **Configure environment**

```bash
cp .env.example .env
# Configure environment variables
```

5. **Start the database**

```bash
encore db proxy
```

6. **Launch the application**

```bash
# Terminal 1 - Backend
encore run

# Terminal 2 - Frontend
npm run dev
```

## 🧪 Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Lint check
npm run lint
```

## 📚 Documentation

Complete documentation is available in the `docs/` folder:

- [Installation Guide](docs/installation.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Contributing Guide](docs/contributing.md)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 Code Standards

- All commits must be in English and follow atomic commit conventions
- Code comments must be in English
- User-facing content must be in French
- Use strict TypeScript mode
- Maintain adequate test coverage
