# 🛠️ Development Guide

> **คู่มือการพัฒนา StayLock สำหรับ AI Agent และ Developer**

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Sorranop01/hotel.git
cd hotel

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# แก้ไขค่าใน .env

# 4. Start development
pnpm dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## Project Setup

### Prerequisites

```bash
# Required versions
node --version  # v20.x+
pnpm --version  # v9.x+
```

### Initialize Project

```bash
# Create project
mkdir staylock && cd staylock

# Init pnpm
pnpm init

# Install core dependencies
pnpm add react react-dom react-router-dom
pnpm add express cors helmet
pnpm add firebase firebase-admin
pnpm add zod @tanstack/react-query axios
pnpm add tailwindcss postcss autoprefixer
pnpm add -D typescript @types/react @types/node @types/express
pnpm add -D vite @vitejs/plugin-react
pnpm add -D tsx nodemon concurrently
```

---

## Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
API_PORT=3000
CLIENT_URL=http://localhost:5173

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Firebase Client (Public)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# LINE Notify (Optional)
LINE_NOTIFY_TOKEN=your-line-token

# SMS API (Optional)
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-secret
```

---

## Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@client/*": ["src/client/*"],
      "@server/*": ["src/server/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@client': path.resolve(__dirname, './src/client'),
      '@server': path.resolve(__dirname, './src/server'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:client\" \"pnpm dev:server\"",
    "dev:client": "vite",
    "dev:server": "nodemon --exec tsx src/server/index.ts",
    "build": "tsc && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "node dist/server/index.js",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  }
}
```

---

## Development Workflow

### 1. Creating a New Feature

```bash
# Example: สร้าง Booking feature

# 1. สร้าง Zod Schema ก่อน (Single Source of Truth)
# src/shared/schemas/booking.schema.ts

# 2. สร้าง Repository (Database access)
# src/server/repositories/booking.repository.ts

# 3. สร้าง Service (Business logic)
# src/server/services/booking.service.ts

# 4. สร้าง Route (API endpoint)
# src/server/routes/booking.routes.ts

# 5. สร้าง API Client (Frontend)
# src/client/domains/booking/api/booking.api.ts

# 6. สร้าง Hook (Data fetching)
# src/client/domains/booking/hooks/useBookings.ts

# 7. สร้าง Components
# src/client/domains/booking/components/

# 8. สร้าง Feature Page
# src/client/domains/booking/features/BookingList.tsx
```

### 2. File Templates

#### Schema Template
```typescript
// src/shared/schemas/{name}.schema.ts
import { z } from 'zod';

export const {Name}Schema = z.object({
  id: z.string(),
  // ... fields
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type {Name} = z.infer<typeof {Name}Schema>;

export const Create{Name}Schema = {Name}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Create{Name}Input = z.infer<typeof Create{Name}Schema>;
```

#### Repository Template
```typescript
// src/server/repositories/{name}.repository.ts
import { db } from '../config/firebase';
import { {Name}, Create{Name}Input } from '@shared/schemas/{name}.schema';

const COLLECTION = '{names}';

export const {name}Repository = {
  async findAll(): Promise<{Name}[]> {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as {Name}));
  },

  async findById(id: string): Promise<{Name} | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as {Name};
  },

  async create(data: Create{Name}Input): Promise<{Name}> {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.findById(docRef.id) as Promise<{Name}>;
  },

  async update(id: string, data: Partial<{Name}>): Promise<{Name}> {
    await db.collection(COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.findById(id) as Promise<{Name}>;
  },

  async delete(id: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).delete();
  },
};
```

#### Route Template
```typescript
// src/server/routes/{name}.routes.ts
import { Router } from 'express';
import { {name}Repository } from '../repositories/{name}.repository';
import { Create{Name}Schema } from '@shared/schemas/{name}.schema';
import { validate } from '../middleware/validate.middleware';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/{names}
router.get('/', auth, async (req, res, next) => {
  try {
    const items = await {name}Repository.findAll();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/{names}/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const item = await {name}Repository.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// POST /api/{names}
router.post('/', auth, validate(Create{Name}Schema), async (req, res, next) => {
  try {
    const item = await {name}Repository.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### API Client Template
```typescript
// src/client/domains/{name}/api/{name}.api.ts
import { api } from '@client/shared/lib/api';
import { {Name}, Create{Name}Input } from '@shared/schemas/{name}.schema';

export const {name}Api = {
  getAll: () => api.get<{Name}[]>('/api/{names}'),
  getById: (id: string) => api.get<{Name}>(`/api/{names}/${id}`),
  create: (data: Create{Name}Input) => api.post<{Name}>('/api/{names}', data),
  update: (id: string, data: Partial<{Name}>) => api.put<{Name}>(`/api/{names}/${id}`, data),
  delete: (id: string) => api.delete(`/api/{names}/${id}`),
};
```

#### Hook Template
```typescript
// src/client/domains/{name}/hooks/use{Names}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {name}Api } from '../api/{name}.api';
import { Create{Name}Input } from '@shared/schemas/{name}.schema';

export function use{Names}() {
  return useQuery({
    queryKey: ['{names}'],
    queryFn: {name}Api.getAll,
  });
}

export function use{Name}(id: string) {
  return useQuery({
    queryKey: ['{names}', id],
    queryFn: () => {name}Api.getById(id),
    enabled: !!id,
  });
}

export function useCreate{Name}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Create{Name}Input) => {name}Api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{names}'] });
    },
  });
}
```

---

## Docker Setup

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  staylock-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_PORT=3000
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Firebase Emulator (Development only)
  firebase-emulator:
    image: andreysenov/firebase-tools
    ports:
      - "4000:4000"   # Emulator UI
      - "8080:8080"   # Firestore
      - "9099:9099"   # Auth
    volumes:
      - ./firebase.json:/home/node/firebase.json
      - ./firestore.rules:/home/node/firestore.rules
    command: firebase emulators:start --project demo-staylock
    profiles:
      - dev
```

---

## Testing

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Example

```typescript
// tests/booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('guest can create a booking', async ({ page }) => {
    await page.goto('/book/sabaidee-hostel');
    
    // Select dates
    await page.fill('[data-testid="checkin-date"]', '2024-01-20');
    await page.fill('[data-testid="checkout-date"]', '2024-01-22');
    await page.click('[data-testid="search-rooms"]');
    
    // Select room
    await page.click('[data-testid="select-room-101"]');
    
    // Fill guest info
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '0891234567');
    
    // Submit
    await page.click('[data-testid="submit-booking"]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
  });
});
```

---

## Git Workflow

### Commit Convention

```bash
# Format: type(scope): description

# Types:
feat     # เพิ่มฟีเจอร์ใหม่
fix      # แก้บั๊ก
refactor # แก้โค้ดโดยไม่เปลี่ยน Logic
docs     # แก้เอกสาร
chore    # งานจิปาถะ (config, build)
test     # เพิ่ม/แก้ Test
style    # แก้ไข formatting

# Examples:
git commit -m "feat(booking): add booking form validation"
git commit -m "fix(auth): fix token expiration issue"
git commit -m "docs: update API documentation"
```

### Branch Strategy

```bash
main        # Production-ready code
develop     # Development branch
feature/*   # Feature branches
bugfix/*    # Bug fix branches
```

---

## Deployment

### Firebase Hosting + Cloud Run

```bash
# Deploy to Firebase Hosting (Frontend)
firebase deploy --only hosting

# Deploy to Cloud Run (Backend)
gcloud run deploy staylock-api \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## Troubleshooting

### Common Issues

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| `CORS error` | API ไม่ได้ set CORS | เพิ่ม `cors()` middleware |
| `Firebase auth error` | Token หมดอายุ | Refresh token หรือ login ใหม่ |
| `Firestore permission denied` | Security rules | ตรวจสอบ firestore.rules |
| `Port already in use` | มี process ค้าง | `lsof -i :3000` แล้ว kill |
