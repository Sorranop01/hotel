# StayLock: Unmanned Hotel SaaS

> **ระบบจัดการที่พักแบบไม่ต้องมี Front Desk**
> **สำหรับ Hostel และที่พักขนาดเล็กในประเทศไทย**

---

## Development Status

| Component | Status | Progress |
|-----------|--------|----------|
| Project Setup | Done | 100% |
| Backend API | Done | 100% |
| Frontend | Pending | 0% |
| Testing | Pending | 0% |

**ดูรายละเอียด:** [docs/00-Development-Progress.md](./docs/00-Development-Progress.md)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development
pnpm dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.x (Strict) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Shadcn/UI |
| Backend | Express.js |
| Database | Firestore |
| Auth | Firebase Auth |
| Validation | Zod |
| State | TanStack Query |

---

## Project Structure

```
hotel-project/
├── src/
│   ├── client/                 # React Frontend
│   │   ├── app/                # App, Router, Providers
│   │   ├── domains/            # Feature modules
│   │   │   ├── auth/
│   │   │   ├── property/
│   │   │   ├── booking/
│   │   │   ├── access-code/
│   │   │   └── dashboard/
│   │   ├── shared/             # Shared components
│   │   └── pages/              # Public pages
│   │
│   ├── server/                 # Express Backend
│   │   ├── config/             # Firebase, env config
│   │   ├── middleware/         # Auth, validation, error
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # API endpoints
│   │   └── services/           # Business logic
│   │
│   └── shared/                 # Shared code
│       ├── schemas/            # Zod schemas
│       ├── types/              # TypeScript types
│       └── constants/          # Constants
│
├── docs/                       # Planning documents
├── specs/                      # Technical specs
├── tests/                      # Playwright tests
├── firebase.json               # Firebase config
├── firestore.rules             # Security rules
└── package.json
```

---

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | `/api/auth/register`, `/api/auth/me` |
| Properties | `/api/properties/*` |
| Rooms | `/api/rooms/*` |
| Bookings | `/api/bookings/*` |
| Access Codes | `/api/access-codes/*` |
| Health | `/api/health` |

---

## Documents

### Planning (docs/)
| File | Description |
|------|-------------|
| [00-Development-Progress.md](./docs/00-Development-Progress.md) | Development status |
| [01-Lean-Canvas.md](./docs/01-Lean-Canvas.md) | Business overview |
| [02-MVP-Roadmap.md](./docs/02-MVP-Roadmap.md) | Development phases |
| [03-Pricing-Strategy.md](./docs/03-Pricing-Strategy.md) | Pricing model |
| [04-Week1-Action-Plan.md](./docs/04-Week1-Action-Plan.md) | Action plan |
| [05-Risk-Assessment.md](./docs/05-Risk-Assessment.md) | Risk analysis |

### Technical Specs (specs/)
| File | Description |
|------|-------------|
| [01_Project_Architecture_Map.md](./specs/01_Project_Architecture_Map.md) | Architecture |
| [02_Database_Schema.md](./specs/02_Database_Schema.md) | Database design |
| [03_API_Specification.md](./specs/03_API_Specification.md) | API docs |
| [04_UI_Specification.md](./specs/04_UI_Specification.md) | UI design |
| [05_Landing_Page_Spec.md](./specs/05_Landing_Page_Spec.md) | Landing page |
| [06_Development_Guide.md](./specs/06_Development_Guide.md) | Dev guide |

---

## Commands

```bash
# Development
pnpm dev              # Start client + server
pnpm dev:client       # Frontend only
pnpm dev:server       # Backend only

# Build
pnpm build            # Production build
pnpm typecheck        # Type check

# Testing
pnpm test             # Playwright tests

# Firebase
firebase emulators:start   # Start emulators
```

---

## MVP Features

1. **Auth System** - Login/Register for property owners
2. **Property Management** - Add/edit properties
3. **Room Management** - Manage rooms and status
4. **Booking System** - Accept bookings, calendar view
5. **Access Code** - Generate 6-digit codes, send via LINE/SMS
6. **Dashboard** - Overview, today's check-ins/outs

---

## Success Metrics (6 months)

| Metric | Target |
|--------|--------|
| Pilot Customers | 3 |
| Paying Customers | 10 |
| MRR | 15,000 THB |
| Churn Rate | < 20% |

---

*StayLock MVP | December 2024*
