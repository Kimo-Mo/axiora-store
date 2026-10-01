# axiora-store Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-09-29

## Active Technologies

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

