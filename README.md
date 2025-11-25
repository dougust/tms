# Dougust

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A full-stack monorepo built with NX, featuring a NestJS backend, Next.js frontend, and shared libraries for UI components, database schemas, and auto-generated API clients.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Database Management](#database-management)
- [Development Workflow](#development-workflow)
- [AI Agent Guide](#ai-agent-guide)
- [Useful Resources](#useful-resources)

## 🏗️ Project Structure

```
dougust/
├── apps/
│   ├── dougust/          # NestJS REST API backend
│   ├── dougust-e2e/      # E2E tests for backend
│   ├── fe/               # Next.js frontend application
│   └── fe-e2e/           # E2E tests for frontend
├── libs/
│   ├── ui/               # Shared ShadCN UI component library
│   ├── database/         # Drizzle ORM schemas and migrations
│   └── autogen-clients/  # Auto-generated React Query hooks
└── docs/                 # Documentation
    └── AI_AGENT_GUIDE.md # Guidelines for AI agents
```

## 🛠️ Technology Stack

### Backend (`apps/dougust`)

- **Framework**: NestJS 11
- **API Type**: REST API
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### Frontend (`apps/fe`)

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **Data Fetching**: TanStack React Query
- **API Client**: Auto-generated from backend

### UI Library (`libs/ui`)

- **Component Library**: ShadCN
- **Base Components**: Radix UI
- **Styling**: Tailwind CSS with class-variance-authority
- **Icons**: Lucide React

### Database (`libs/database`)

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Container**: Docker Compose
- **Migrations**: Drizzle Kit

### API Clients (`libs/autogen-clients`)

- **Generator**: Kubb
- **Type**: React Query hooks
- **Source**: Auto-generated from backend OpenAPI spec

## 🚀 Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc` or package.json engines)
- Docker and Docker Compose (for PostgreSQL)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up the database:
   ```sh
   npm run db:restore
   ```
   This will start PostgreSQL, run migrations, and seed the database.

### Running the Applications

**Backend (NestJS):**

```sh
npx nx serve dougust
```

**Frontend (Next.js):**

```sh
npx nx serve fe
```

**Development Mode (watch both):**

```sh
npx nx run-many --target=serve --projects=dougust,fe
```

## 📝 Development Commands

### General NX Commands

```sh
# View project graph
npx nx graph

# Show available targets for a project
npx nx show project <project-name>

# Run tests
npx nx test <project-name>

# Build for production
npx nx build <project-name>

# Lint a project
npx nx lint <project-name>

# List all projects
npx nx list
```

### Application-Specific Commands

**Backend:**

```sh
npx nx serve dougust      # Run dev server
npx nx build dougust      # Build for production
npx nx test dougust       # Run tests
```

**Frontend:**

```sh
npx nx serve fe           # Run dev server
npx nx build fe           # Build for production
npx nx test fe            # Run tests
```

**E2E Tests:**

```sh
npx nx e2e dougust-e2e    # Backend E2E tests
npx nx e2e fe-e2e         # Frontend E2E tests
```

## 🗄️ Database Management

### Docker Commands

```sh
npm run db:up          # Start PostgreSQL container
npm run db:down        # Stop PostgreSQL container
npm run db:clean       # Stop and remove volumes (deletes data)
```

### Schema Management

```sh
npm run db:generate    # Generate migration from schema changes
npm run db:migrate     # Run pending migrations
npm run db:seed        # Seed database with test data
npm run db:restore     # Clean slate: down, up, migrate, seed
```

### Workflow for Schema Changes

1. Edit schema in `libs/database/src/schema/`
2. Generate migration: `npm run db:generate`
3. Review migration in `libs/database/drizzle/`
4. Apply migration: `npm run db:migrate`
5. Update seed data if needed: `npm run db:seed`

## 🔄 Development Workflow

### Adding New Features

Follow this order for full-stack features:

1. **Database Schema** (`libs/database`)

   - Define/update schema in Drizzle
   - Generate and run migrations

2. **Backend API** (`apps/dougust`)

   - Create/update NestJS controllers and services
   - Add validation with class-validator
   - Document with Swagger decorators

3. **API Clients** (`libs/autogen-clients`)

   - Clients are auto-generated from backend OpenAPI spec
   - No manual changes needed

4. **UI Components** (`libs/ui`)

   - Add ShadCN components as needed
   - **Important**: Always run ShadCN CLI from `libs/ui` directory
   - Example: `cd libs/ui && npx shadcn@latest add button`

5. **Frontend Integration** (`apps/fe`)
   - Use auto-generated React Query hooks
   - Compose UI from `libs/ui` components

### Working with ShadCN Components

**Adding components:**

```sh
cd libs/ui
npx shadcn@latest add <component-name>
```

**Modifying components:**

- UI components can be customized as needed
- When modifying, add a comment at the top:
  ```typescript
  // Modified from original ShadCN component - [Brief description]
  // Original added via: npx shadcn@latest add <component-name>
  ```

### Important Notes

- ⚠️ **Never modify `libs/autogen-clients` directly** - these are auto-generated
- ✅ **Always run ShadCN commands from `libs/ui` directory**
- 🔍 **Use MCP tools for NX and ShadCN guidance** (see AI Agent Guide)

## 🤖 AI Agent Guide

If you're an AI agent working on this codebase, please read [`docs/AI_AGENT_GUIDE.md`](./docs/AI_AGENT_GUIDE.md) for detailed guidelines on:

- Repository structure and conventions
- Technology stack details
- Development workflow
- MCP tool usage for NX and ShadCN
- Best practices and common pitfalls

## 📚 Useful Resources

### Framework Documentation

- [NX Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [ShadCN UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### NX Resources

- [NX Console](https://nx.dev/getting-started/editor-setup) - IDE extension
- [Run Tasks](https://nx.dev/features/run-tasks)
- [Generate Code](https://nx.dev/features/generate-code)
- [NX Plugins](https://nx.dev/concepts/nx-plugins)
- [NX on CI](https://nx.dev/ci/intro/ci-with-nx)

### Adding Projects

Generate new applications:

```sh
npx nx g @nx/nest:app <app-name>    # NestJS app
npx nx g @nx/next:app <app-name>    # Next.js app
```

Generate new libraries:

```sh
npx nx g @nx/node:lib <lib-name>    # Node.js library
npx nx g @nx/react:lib <lib-name>   # React library
```

### Community

- [NX Discord](https://go.nx.dev/community)
- [NX on X/Twitter](https://twitter.com/nxdevtools)
- [NX Blog](https://nx.dev/blog)

## 📄 License

MIT
