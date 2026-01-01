# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StayLock is an unmanned hotel SaaS MVP for small hostels (5-20 rooms) in Thailand. It provides property management, bookings, and access code generation without requiring a front desk.

**Status:** Backend API 100% complete, Frontend pending.

## Commands

```bash
# Development (starts both client and server)
pnpm dev

# Individual services
pnpm dev:client       # Frontend only (port 5173)
pnpm dev:server       # Backend only (port 3000)

# Build
pnpm build            # Production build (client + server)
pnpm build:server     # Server only

# Quality
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm lint:fix         # Auto-fix lint issues

# Testing
pnpm test             # Run Playwright tests
pnpm test:ui          # Playwright with UI

# Firebase
firebase emulators:start   # Local emulators
```

## Architecture

### Monorepo Structure
```
src/
├── client/           # React frontend (Vite)
├── server/           # Express backend
└── shared/           # Shared code between client/server
```

### Path Aliases
- `@/*` → `src/*`
- `@client/*` → `src/client/*`
- `@server/*` → `src/server/*`
- `@shared/*` → `src/shared/*`

### Data Flow
```
React (TanStack Query) → Express Routes → Services → Repositories → Firestore
```

### Key Architectural Decisions

**Zod as Single Source of Truth:** All validation schemas live in `src/shared/schemas/`. Types are inferred from schemas using `z.infer<>`. Both client and server import from here.

**Repository Pattern:** All database access goes through `src/server/repositories/`. Each entity has a repository extending `BaseRepository<T>`.

**Domain-Based Frontend:** Client features are organized by domain in `src/client/domains/` (auth, property, booking, access-code, dashboard). Each domain contains its own components, hooks, pages, and API clients.

**Firebase Auth + Custom Users:** Authentication uses Firebase Auth tokens verified server-side. User profiles are stored in Firestore with the `users` collection.

## API Routes

All endpoints prefixed with `/api`:

| Route | Purpose |
|-------|---------|
| `/api/health` | Health check |
| `/api/auth/*` | Authentication (register, me) |
| `/api/properties/*` | Property CRUD |
| `/api/rooms/*` | Room management |
| `/api/bookings/*` | Booking management |
| `/api/access-codes/*` | Access code generation |

## Authentication

- Firebase Auth handles user authentication
- Backend validates Firebase ID tokens via `authMiddleware`
- Role-based access via `requireRole()` middleware
- User info attached to `req.user` after auth

## Environment Setup

Copy `.env.example` to `.env`. Required variables:
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (server)
- `VITE_FIREBASE_*` prefixed variables (client)

## Firestore Collections

- `users` - User profiles (linked to Firebase Auth UID)
- `properties` - Hotel/hostel properties
- `rooms` - Rooms within properties
- `bookings` - Guest bookings
- `accessCodes` - Generated access codes
- `accessCodeHistory` - Code usage audit log

## Frontend Patterns

**UI Components:** Shadcn/UI-style components in `src/client/shared/components/ui/`

**Data Fetching:** TanStack Query hooks in each domain's `hooks/` folder. Query keys follow `[entity, id?]` pattern.

**Auth Context:** `useAuth()` hook from `src/client/domains/auth/context/auth-context.tsx` provides user state, login, register, logout.

## Commit Convention

```
type(scope): description

Types: feat, fix, refactor, docs, chore, test, style
Example: feat(booking): add booking form validation
```
