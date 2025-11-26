# AI Agent Guide for Dougust Monorepo

## Overview

This document provides guidance for AI agents working on the Dougust monorepo. Follow these guidelines when implementing features, fixing bugs, or making changes to the codebase.

## Repository Structure

### NX Monorepo

This is an **NX monorepo**. For any NX-related questions or tasks:

- **Always use the MCP (Model Context Protocol) tools** available for NX guidance
- If the MCP server is down or unavailable, **prompt the user to fix it** before proceeding
- Never assume knowledge about NX without consulting MCP first

### ShadCN MCP

- **ShadCN MCP tools are available** and should be used for all ShadCN-related tasks
- Use MCP to discover available components, get usage examples, and add components to the project

### Project Structure

```
dougust/
├── apps/
│   ├── dougust/          # NestJS Backend
│   └── fe/               # Next.js Frontend
├── libs/
│   ├── ui/               # ShadCN components
│   ├── database/         # Drizzle PostgreSQL schemas
│   └── clients/          # Auto-generated React Query hooks
└── docs/                 # Documentation
```

## Technology Stack

### Backend (`apps/dougust`)

- **Framework**: NestJS
- **Type**: REST API backend
- **Location**: `apps/dougust`

### Frontend (`apps/fe`)

- **Framework**: Next.js
- **Location**: `apps/fe`

### UI Components (`libs/ui`)

- **Library**: ShadCN
- **Type**: Shared UI component library
- **Location**: `libs/ui`
- **Important**: All ShadCN CLI commands must be run from the `libs/ui` directory

### Database (`libs/database`)

- **ORM**: Drizzle
- **Database**: PostgreSQL
- **Type**: Database schemas and migrations
- **Location**: `libs/database`

### API Clients (`libs/clients`)

- **Type**: Auto-generated React Query hooks
- **Generation**: Automatically generated from backend API
- **Location**: `libs/clients`
- **Note**: These hooks are generated, so changes should be made in the backend API, not directly in this library

## Development Workflow

### Adding New Features

1. **Database Changes**: Start with schema changes in `libs/database`
2. **Backend Implementation**: Implement API endpoints in `apps/dougust`
3. **Client Generation**: Backend will auto-generate React Query hooks in `libs/clients`
4. **UI Components**: Create/update ShadCN components in `libs/ui` if needed
5. **Frontend Integration**: Use generated hooks in `apps/fe` to consume the API

### Working with ShadCN Components

#### Adding New Components

- **Always run ShadCN CLI commands from `libs/ui` directory**
- Use ShadCN MCP tools to discover and add components
- Example workflow:
  1. Use MCP to find the component you need
  2. Get the CLI command from MCP
  3. Run the command from `libs/ui` directory

#### Modifying Existing Components

- UI component files **can be modified** as needed for your use case
- **IMPORTANT**: When modifying a component that was added via ShadCN CLI, **always add a comment at the top of the file**:
  ```typescript
  // Modified from original ShadCN component - [Brief description of changes]
  // Original added via: npx shadcn@latest add [component-name]
  ```
- This helps the user track which components have been customized vs. keeping original implementations

### Important Notes

- **Never modify `libs/clients` directly** - these are auto-generated
- Always check MCP for NX commands and best practices
- Follow NX workspace conventions for imports and dependencies
- Use the monorepo's shared TypeScript configuration

## Questions and Troubleshooting

### NX-Related Questions

- Use MCP tools to get accurate, up-to-date information about:
  - Running applications
  - Building projects
  - Running tests
  - Managing dependencies
  - NX configuration

### MCP Server Issues

If you cannot access MCP tools, immediately inform the user:

> "The MCP server appears to be down. Please fix the MCP connection so I can provide accurate NX and ShadCN guidance."

## Best Practices

- Always verify NX commands through MCP before suggesting them
- Maintain clear separation between backend and frontend concerns
- Follow the established library boundaries
- Keep UI components reusable and well-documented
- Ensure database migrations are reversible when possible
