# axiora-store Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-10-01

## Active Technologies
- TypeScript 5.9 (backend pinned `^5.5.4`, frontend `^5.9.3`); Node.js 20+ + Backend — Express 4.19, Prisma 5.20, PostgreSQL, `bcrypt` 5.1, `jsonwebtoken` 9, `zod` 3.23, `cookie-parser` 1.4, `helmet` 8, `express-rate-limit` (**7.2 → 8.x, see research.md D-6**), `cors` 2.8. Frontend — Next.js 16.1.4 (App Router, `proxy.ts`), React 19, TanStack Query 5, Zustand 5, React Hook Form 7 + `zod` 4, `sonner` 2, `next-intl` 4 (main)
- PostgreSQL via Prisma ORM. Session state in `RefreshToken` (opaque digest only). No Redis — the default in-memory rate-limit store is sufficient for single-node deployment (see research.md D-6) (main)

- TypeScript 5 + Next.js 16.1.4 (App Router, Turbopack), React 19 + Tailwind CSS v4 (`@import 'tailwindcss'`, `@custom-variant dark`, `@theme inline`), `next/font/google` (Inter + IBM Plex Sans Arabic), `nextjs-toploader`, shadcn/Radix primitives, Lucide React (001-axiora-design-system-branding)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5 + Next.js 16.1.4 (App Router, Turbopack), React 19: Follow standard conventions

## Recent Changes
- main: Added TypeScript 5.9 (backend pinned `^5.5.4`, frontend `^5.9.3`); Node.js 20+ + Backend — Express 4.19, Prisma 5.20, PostgreSQL, `bcrypt` 5.1, `jsonwebtoken` 9, `zod` 3.23, `cookie-parser` 1.4, `helmet` 8, `express-rate-limit` (**7.2 → 8.x, see research.md D-6**), `cors` 2.8. Frontend — Next.js 16.1.4 (App Router, `proxy.ts`), React 19, TanStack Query 5, Zustand 5, React Hook Form 7 + `zod` 4, `sonner` 2, `next-intl` 4

- 001-axiora-design-system-branding: Added TypeScript 5 + Next.js 16.1.4 (App Router, Turbopack), React 19 + Tailwind CSS v4 (`@import 'tailwindcss'`, `@custom-variant dark`, `@theme inline`), `next/font/google` (Inter + IBM Plex Sans Arabic), `nextjs-toploader`, shadcn/Radix primitives, Lucide React

<!-- MANUAL ADDITIONS START -->
## Phase & Delegation Git Workflow Mandate

1. **Dedicated Phase Branch**:
   - NEVER implement, write code, or delegate implementation directly on `main`.
   - Before executing tasks for any phase (via `/speckit-implement`, `/opencode-delegate`, `/agy-delegate`, or inline), the orchestrator MUST explicitly create and checkout a dedicated phase branch:
     `git checkout -b <phase-id>-<phase-name>` (e.g., `004-auth-customer-accounts`).

2. **Delegation Role Boundaries**:
   - Implementer CLIs (`opencode`, `agy`, `codex`) are strictly implementers that edit the working tree in headless runs. They DO NOT manage git branches and DO NOT commit.
   - The orchestrator owns git branching, diff review, type/lint checks, and committing.

3. **Phase Landing Protocol**:
   - Verify code, quality gates, and manual checklists on the phase branch.
   - Stage and commit verified changes on the phase branch:
     `git commit -m "feat(<phase-id>): <description>"`
   - Push branch to remote: `git push -u origin <branch>`
   - Checkout `main`, pull latest: `git checkout main && git pull`
   - Merge with non-fast-forward: `git merge --no-ff <branch>`
   - Push main: `git push origin main`
<!-- MANUAL ADDITIONS END -->

