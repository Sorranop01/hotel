# 📐 Project Architecture Map: StayLock

> **AI Agent: อ่านไฟล์นี้ก่อนทำอะไรทุกครั้ง**

## 🎯 Project Overview

| รายการ | รายละเอียด |
|--------|------------|
| **ชื่อโปรเจค** | StayLock - Unmanned Hotel SaaS |
| **ประเภท** | Type A: Small Project / MVP |
| **เป้าหมาย** | ระบบจัดการที่พักแบบไม่ต้องมี Front Desk |
| **กลุ่มเป้าหมาย** | เจ้าของ Hostel ขนาดเล็ก (5-20 ห้อง) |

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Language** | TypeScript | 5.x+ (Strict Mode) |
| **Runtime** | Node.js | 20.x+ |
| **Package Manager** | pnpm | 9.x+ |
| **Frontend** | React + Vite | 18.x+ |
| **Styling** | Tailwind CSS + Shadcn/UI | 3.x+ |
| **Backend** | Express.js | 4.x+ |
| **Database** | Firestore | Firebase SDK Modular |
| **Validation** | Zod | 3.x+ |
| **State** | TanStack Query | 5.x+ |

## 📁 Project Structure

```
staylock/
├── src/
│   ├── client/                 # React Frontend
│   │   ├── app/                # App setup, Router, Providers
│   │   ├── domains/            # Feature-Sliced Design
│   │   │   ├── auth/
│   │   │   ├── property/
│   │   │   ├── booking/
│   │   │   ├── access-code/
│   │   │   └── dashboard/
│   │   ├── shared/             # Shared UI components
│   │   └── pages/              # Public pages (Landing, Guest Booking)
│   │
│   ├── server/                 # Express Backend
│   │   ├── routes/
│   │   ├── repositories/       # Database access
│   │   ├── services/           # Business logic
│   │   ├── middleware/
│   │   └── config/
│   │
│   └── shared/                 # Shared (Client + Server)
│       ├── schemas/            # Zod Schemas (Single Source of Truth)
│       ├── types/              # TypeScript types
│       └── constants/
│
├── public/
├── tests/
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔄 Data Flow

```
Client (React) 
    ↓ HTTP/REST
Server (Express Routes → Services → Repositories)
    ↓
Firestore (users, properties, rooms, bookings, accessCodes)
```

## 🎨 Routes Structure

### Admin Panel (`/admin/*`)
- `/admin/dashboard` - หน้าหลัก
- `/admin/properties` - จัดการที่พัก
- `/admin/rooms` - จัดการห้อง
- `/admin/bookings` - จัดการ Booking
- `/admin/access-codes` - จัดการรหัส

### Public Pages
- `/` - Landing Page (Pilot Signup)
- `/book/:propertySlug` - หน้าจอง
- `/checkin/:code` - หน้ากรอกรหัส

## 📋 Documents Index

| ไฟล์ | รายละเอียด |
|------|------------|
| `02_Database_Schema.md` | Firestore Collections + Zod Schemas |
| `03_API_Specification.md` | REST API Endpoints |
| `04_UI_Specification.md` | หน้าจอและ Components |
| `05_Landing_Page_Spec.md` | Landing Page Design |
| `06_Development_Guide.md` | คำสั่ง Setup + Workflow |
