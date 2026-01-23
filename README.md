# DevTeam AI - Collaborative AI Code Editor

A multi-agent AI code editor where specialized AI agents collaborate to build software projects.

## Architecture

This project is a monorepo managed by `pnpm` workspaces:

- `apps/web`: Next.js 14 Frontend
- `apps/api`: Fastify Backend API
- `packages/ui`: Shared UI components (shadcn/ui)
- `packages/database`: Prisma schema and client
- `packages/shared`: Shared utilities and types
- `packages/agents`: AI Agent Core Logic

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

## License

MIT
