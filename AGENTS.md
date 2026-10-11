# Axiora Store — Agent Guidelines

Guidelines and constraints for AI agents and orchestrators working on Axiora Store.

---

## 1. Project Overview & Architecture

Axiora Store is a bilingual (Arabic default, English secondary) physical e-commerce platform for electronics and mobile devices in Egypt, based on a two-workspace monorepo:

- **`backend/`**: Node.js + Express + TypeScript API server using Prisma ORM with PostgreSQL.
- **`frontend/`**: Next.js 16 (App Router) + React 19 + TypeScript storefront with Tailwind CSS v4 and shadcn/Radix primitives.

---

## 2. Tech Stack

- **Backend**: Node.js 20+, Express 4.19, Prisma 5.20, PostgreSQL (with `pg_trgm`), `bcrypt`, `jsonwebtoken`, `zod` 3.23, `helmet`, `express-rate-limit`, `cookie-parser`, `cors`.
- **Frontend**: Next.js 16.1.4 (App Router, Turbopack, `proxy.ts`), React 19, Tailwind CSS v4, `next-intl` 4, TanStack Query 5, Zustand 5, React Hook Form 7, `zod` 4, Lucide React, `sonner`.
- **Media**: Multer memory storage streamed to Cloudinary via backend SDK.
- **Monetary Unit**: EGP. All money fields use Prisma `@db.Decimal(12, 2)` — never `Float`.

---

## 3. Core Architectural Rules

1. **Server Authority (Zero Trust)**: The frontend is purely presentational. Line item prices, shipping fees, COD charges, and order totals are always computed and validated server-side from database records.
2. **Variant-Centric Inventory**: Every physical product has at least one `ProductVariant`. Inventory (`stockQuantity`, `reservedQuantity`) and cart line items (`CartItem`) anchor strictly to `variantId`, never `productId`. Stock reservations must be atomic SQL updates.
3. **Session & Security**: Short-lived JWT access tokens (15m) + rotating opaque refresh tokens (7d) in HttpOnly `SameSite=Lax` cookies (`Secure` in production). CSRF protection via Origin/Referer check on mutating routes.
4. **State Discipline**:
   - **Server Cache**: TanStack Query is the exclusive client cache for server data. Never duplicate server entities into Zustand.
   - **Client State**: Zustand with `localStorage` is strictly for guest carts and ephemeral UI state.
   - **Cart Merge**: On login, guest carts merge into the database cart via `POST /api/v1/cart/merge`, which becomes the single source of truth.
5. **Bilingual & RTL Parity**: Arabic is the primary default locale; English is secondary. All UI components must maintain bidirectional symmetry across RTL and LTR. Database entities store bilingual columns (`*Ar` / `*En`).
6. **Testing Policy (Constitution Principle VII)**: Automated test suites and test files are **out of scope** (personal learning project). Agents MUST NOT create automated test files or tasks. Verification relies strictly on static quality gates (`tsc --noEmit`, `npm run lint`, `npm run build`) and manual checklists.

---

## 4. Essential Commands

### Backend (`cd backend`)
- `npm run dev`: Start Express development server (port 5000)
- `npm run build`: Compile TypeScript to `dist/`
- `npx prisma migrate dev`: Apply database migrations
- `npx prisma studio`: Open Prisma database visualizer

### Frontend (`cd frontend`)
- `npm run dev`: Start Next.js development server (port 3000)
- `npm run build`: Production Next.js build
- `npm run lint`: ESLint check

---

## 5. Phase & Delegation Git Workflow Mandate

### Rule 1: Dedicated Phase Branch
- **NEVER** write code, implement features, or delegate implementation directly on `main`.
- Before executing any phase or task (via `/speckit-implement`, `/opencode-delegate`, `/agy-delegate`, or inline), the orchestrator MUST checkout a dedicated branch:
  ```bash
  git checkout -b <phase-id>-<phase-name>
  ```
  *(Example: `git checkout -b 008-cod-phone-verification`)*

### Rule 2: Delegation Role Boundaries
- Implementer CLIs (`opencode`, `agy`, `codex`) are strictly headless code writers in the working tree. They **DO NOT** manage git branches and **DO NOT** commit.
- The orchestrator owns git branching, diff review, type/lint checks, and committing.

### Rule 3: Phase Landing Protocol (Explicit User Request Mandate)
- **NEVER AUTOMATE LANDING**: The orchestrator/agent MUST NEVER run `git commit`, `git push`, or `git merge` automatically or autonomously.
- Complete implementation, run type checks (`npx tsc --noEmit`), linting, and checklist verification in the working tree on the phase branch.
- Present completed work and verification summary to the user for manual review.
- **ONLY** when the user EXPLICITLY requests or instructs to commit/push/merge (e.g., "commit", "merge", "push"), execute the landing sequence:
  1. Stage and commit verified changes on the phase branch:
     ```bash
     git add .
     git commit -m "feat(<phase-id>): <description>"
     ```
  2. Push branch to remote:
     ```bash
     git push -u origin <branch>
     ```
  3. Checkout `main` and pull latest:
     ```bash
     git checkout main && git pull
     ```
  4. Merge with non-fast-forward:
     ```bash
     git merge --no-ff <branch> -m "feat(<phase-id>): merge <description> into main"
     ```
  5. Push `main`:
     ```bash
     git push origin main
     ```
