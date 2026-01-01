# 🗄️ Database Schema Specification

> **Firestore Collections + Zod Schemas**

## 📊 Collections Overview

```
firestore/
├── users/              # ผู้ใช้ระบบ (เจ้าของที่พัก)
├── properties/         # ที่พัก
├── rooms/              # ห้องพัก
├── bookings/           # การจอง
├── accessCodes/        # รหัสเข้าพัก
└── pilotSignups/       # ผู้สมัคร Pilot Program
```

---

## 1. Users Collection

### Firestore Path: `users/{userId}`

```typescript
// src/shared/schemas/user.schema.ts
import { z } from 'zod';

export const UserRoleEnum = z.enum(['owner', 'staff', 'admin']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  phone: z.string().regex(/^0[0-9]{9}$/).optional(),
  role: UserRoleEnum.default('owner'),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleEnum>;

// Create Input (ไม่ต้องมี id, timestamps)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

### Sample Document:
```json
{
  "id": "user_abc123",
  "email": "somchai@email.com",
  "displayName": "สมชาย ใจดี",
  "phone": "0891234567",
  "role": "owner",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 2. Properties Collection

### Firestore Path: `properties/{propertyId}`

```typescript
// src/shared/schemas/property.schema.ts
import { z } from 'zod';

export const PropertyTypeEnum = z.enum([
  'hostel',
  'guesthouse',
  'apartment',
  'resort',
  'other'
]);

export const PropertySchema = z.object({
  id: z.string(),
  ownerId: z.string(), // Reference to users collection
  name: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/), // URL-friendly
  type: PropertyTypeEnum.default('hostel'),
  description: z.string().max(2000).optional(),
  address: z.object({
    street: z.string(),
    district: z.string(),
    province: z.string(),
    postalCode: z.string().regex(/^[0-9]{5}$/),
    country: z.string().default('Thailand'),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string().email().optional(),
    lineId: z.string().optional(),
  }),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
  policies: z.object({
    checkInTime: z.string().default('14:00'),
    checkOutTime: z.string().default('12:00'),
    cancellationHours: z.number().default(24),
    minNights: z.number().default(1),
    maxNights: z.number().default(30),
  }),
  settings: z.object({
    currency: z.string().default('THB'),
    timezone: z.string().default('Asia/Bangkok'),
    autoGenerateCode: z.boolean().default(true),
    codeExpiryHours: z.number().default(2), // หลัง checkout กี่ชม.
  }),
  isActive: z.boolean().default(true),
  totalRooms: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Property = z.infer<typeof PropertySchema>;
export type PropertyType = z.infer<typeof PropertyTypeEnum>;

export const CreatePropertySchema = PropertySchema.omit({
  id: true,
  slug: true, // Auto-generate from name
  totalRooms: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
```

### Sample Document:
```json
{
  "id": "prop_xyz789",
  "ownerId": "user_abc123",
  "name": "สบายดี โฮสเทล",
  "slug": "sabaidee-hostel",
  "type": "hostel",
  "description": "ที่พักราคาประหยัดใจกลางเมืองเชียงใหม่",
  "address": {
    "street": "123 ถ.เจริญเมือง",
    "district": "เมือง",
    "province": "เชียงใหม่",
    "postalCode": "50000",
    "country": "Thailand"
  },
  "contact": {
    "phone": "0891234567",
    "email": "sabaidee@email.com",
    "lineId": "@sabaidee"
  },
  "images": ["https://storage.../image1.jpg"],
  "amenities": ["wifi", "aircon", "parking"],
  "policies": {
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "cancellationHours": 24,
    "minNights": 1,
    "maxNights": 30
  },
  "settings": {
    "currency": "THB",
    "timezone": "Asia/Bangkok",
    "autoGenerateCode": true,
    "codeExpiryHours": 2
  },
  "isActive": true,
  "totalRooms": 10,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 3. Rooms Collection

### Firestore Path: `rooms/{roomId}`

```typescript
// src/shared/schemas/room.schema.ts
import { z } from 'zod';

export const RoomTypeEnum = z.enum([
  'standard',
  'deluxe',
  'suite',
  'dormitory',
  'family'
]);

export const RoomStatusEnum = z.enum([
  'available',    // ว่าง พร้อมจอง
  'occupied',     // มีคนเข้าพัก
  'reserved',     // จองแล้ว รอเข้าพัก
  'cleaning',     // กำลังทำความสะอาด
  'maintenance',  // ซ่อมบำรุง
  'blocked'       // ปิดการจอง
]);

export const RoomSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1).max(50), // e.g., "101", "A-01"
  floor: z.number().optional(),
  type: RoomTypeEnum.default('standard'),
  description: z.string().max(500).optional(),
  capacity: z.object({
    adults: z.number().min(1).default(2),
    children: z.number().default(0),
  }),
  beds: z.array(z.object({
    type: z.enum(['single', 'double', 'queen', 'king', 'bunk']),
    count: z.number().min(1),
  })).default([]),
  amenities: z.array(z.string()).default([]),
  pricing: z.object({
    basePrice: z.number().min(0), // ราคาต่อคืน
    weekendPrice: z.number().min(0).optional(),
    extraPersonPrice: z.number().min(0).default(0),
  }),
  images: z.array(z.string().url()).default([]),
  status: RoomStatusEnum.default('available'),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
export type RoomType = z.infer<typeof RoomTypeEnum>;
export type RoomStatus = z.infer<typeof RoomStatusEnum>;

export const CreateRoomSchema = RoomSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export const UpdateRoomStatusSchema = z.object({
  status: RoomStatusEnum,
  note: z.string().optional(),
});
```

### Sample Document:
```json
{
  "id": "room_001",
  "propertyId": "prop_xyz789",
  "name": "101",
  "floor": 1,
  "type": "standard",
  "description": "ห้องเตียงเดี่ยว พร้อมแอร์",
  "capacity": {
    "adults": 2,
    "children": 1
  },
  "beds": [
    { "type": "double", "count": 1 }
  ],
  "amenities": ["aircon", "wifi", "tv", "minibar"],
  "pricing": {
    "basePrice": 500,
    "weekendPrice": 600,
    "extraPersonPrice": 100
  },
  "images": [],
  "status": "available",
  "sortOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## 4. Bookings Collection

### Firestore Path: `bookings/{bookingId}`

```typescript
// src/shared/schemas/booking.schema.ts
import { z } from 'zod';

export const BookingStatusEnum = z.enum([
  'pending',      // รอชำระเงิน
  'confirmed',    // ยืนยันแล้ว
  'checked_in',   // เช็คอินแล้ว
  'checked_out',  // เช็คเอาท์แล้ว
  'cancelled',    // ยกเลิก
  'no_show'       // ไม่มา
]);

export const PaymentStatusEnum = z.enum([
  'pending',      // รอชำระ
  'paid',         // ชำระแล้ว
  'partial',      // ชำระบางส่วน
  'refunded',     // คืนเงินแล้ว
  'failed'        // ชำระไม่สำเร็จ
]);

export const BookingSchema = z.object({
  id: z.string(),
  bookingNumber: z.string(), // e.g., "BK-20240115-001"
  propertyId: z.string(),
  roomId: z.string(),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    idNumber: z.string().optional(), // เลขบัตรประชาชน/Passport
    nationality: z.string().default('Thai'),
    specialRequests: z.string().optional(),
  }),
  dates: z.object({
    checkIn: z.date(),
    checkOut: z.date(),
    nights: z.number().min(1),
  }),
  guests: z.object({
    adults: z.number().min(1),
    children: z.number().default(0),
  }),
  pricing: z.object({
    roomRate: z.number(), // ราคาห้องต่อคืน
    totalRoomCharge: z.number(),
    extraCharges: z.number().default(0),
    discount: z.number().default(0),
    tax: z.number().default(0),
    grandTotal: z.number(),
  }),
  payment: z.object({
    status: PaymentStatusEnum.default('pending'),
    method: z.enum(['cash', 'transfer', 'promptpay', 'card']).optional(),
    paidAmount: z.number().default(0),
    paidAt: z.date().optional(),
    transactionRef: z.string().optional(),
  }),
  accessCode: z.object({
    code: z.string().optional(),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
    sentAt: z.date().optional(),
    sentVia: z.enum(['sms', 'line', 'email']).optional(),
  }).optional(),
  status: BookingStatusEnum.default('pending'),
  notes: z.string().optional(),
  source: z.enum(['direct', 'walkin', 'ota', 'phone']).default('direct'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

// Guest Booking Form (Public)
export const CreateBookingSchema = z.object({
  propertyId: z.string(),
  roomId: z.string(),
  guest: z.object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    phone: z.string().min(10, 'เบอร์โทรไม่ถูกต้อง'),
    specialRequests: z.string().optional(),
  }),
  checkIn: z.string(), // YYYY-MM-DD
  checkOut: z.string(),
  adults: z.number().min(1),
  children: z.number().default(0),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
```

### Sample Document:
```json
{
  "id": "book_abc123",
  "bookingNumber": "BK-20240115-001",
  "propertyId": "prop_xyz789",
  "roomId": "room_001",
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@email.com",
    "phone": "0891234567",
    "nationality": "Thai",
    "specialRequests": "ขอห้องชั้น 1"
  },
  "dates": {
    "checkIn": "2024-01-20T14:00:00Z",
    "checkOut": "2024-01-22T12:00:00Z",
    "nights": 2
  },
  "guests": {
    "adults": 2,
    "children": 0
  },
  "pricing": {
    "roomRate": 500,
    "totalRoomCharge": 1000,
    "extraCharges": 0,
    "discount": 0,
    "tax": 70,
    "grandTotal": 1070
  },
  "payment": {
    "status": "paid",
    "method": "promptpay",
    "paidAmount": 1070,
    "paidAt": "2024-01-15T11:00:00Z",
    "transactionRef": "PP-123456"
  },
  "accessCode": {
    "code": "482916",
    "validFrom": "2024-01-20T12:00:00Z",
    "validUntil": "2024-01-22T14:00:00Z",
    "sentAt": "2024-01-15T11:05:00Z",
    "sentVia": "line"
  },
  "status": "confirmed",
  "source": "direct",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

---

## 5. Access Codes Collection

### Firestore Path: `accessCodes/{codeId}`

```typescript
// src/shared/schemas/access-code.schema.ts
import { z } from 'zod';

export const AccessCodeTypeEnum = z.enum([
  'guest',        // สำหรับผู้เข้าพัก
  'staff',        // สำหรับพนักงาน
  'maintenance',  // สำหรับช่างซ่อม
  'emergency'     // ฉุกเฉิน
]);

export const AccessCodeSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  bookingId: z.string().optional(), // null if staff/maintenance
  roomId: z.string().optional(),
  code: z.string().length(6), // 6-digit code
  type: AccessCodeTypeEnum.default('guest'),
  name: z.string().optional(), // ชื่อผู้ใช้รหัส
  validFrom: z.date(),
  validUntil: z.date(),
  usageCount: z.number().default(0),
  maxUsage: z.number().optional(), // null = unlimited
  lastUsedAt: z.date().optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string(), // userId
  createdAt: z.date(),
});

export type AccessCode = z.infer<typeof AccessCodeSchema>;
export type AccessCodeType = z.infer<typeof AccessCodeTypeEnum>;

export const GenerateAccessCodeSchema = z.object({
  propertyId: z.string(),
  bookingId: z.string().optional(),
  roomId: z.string().optional(),
  type: AccessCodeTypeEnum.default('guest'),
  name: z.string().optional(),
  validFrom: z.string(), // ISO date string
  validUntil: z.string(),
  maxUsage: z.number().optional(),
});
export type GenerateAccessCodeInput = z.infer<typeof GenerateAccessCodeSchema>;

export const ValidateCodeSchema = z.object({
  propertyId: z.string(),
  code: z.string().length(6),
});
```

### Sample Document:
```json
{
  "id": "code_xyz123",
  "propertyId": "prop_xyz789",
  "bookingId": "book_abc123",
  "roomId": "room_001",
  "code": "482916",
  "type": "guest",
  "name": "John Doe",
  "validFrom": "2024-01-20T12:00:00Z",
  "validUntil": "2024-01-22T14:00:00Z",
  "usageCount": 3,
  "maxUsage": null,
  "lastUsedAt": "2024-01-21T08:30:00Z",
  "isActive": true,
  "createdBy": "system",
  "createdAt": "2024-01-15T11:05:00Z"
}
```

---

## 6. Pilot Signups Collection

### Firestore Path: `pilotSignups/{signupId}`

```typescript
// src/shared/schemas/pilot-signup.schema.ts
import { z } from 'zod';

export const PilotSignupStatusEnum = z.enum([
  'new',          // สมัครใหม่
  'contacted',    // ติดต่อแล้ว
  'interested',   // สนใจ
  'onboarding',   // กำลัง onboard
  'active',       // เป็น pilot แล้ว
  'rejected',     // ไม่ผ่าน
  'cancelled'     // ยกเลิก
]);

export const PilotSignupSchema = z.object({
  id: z.string(),
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  lineId: z.string().optional(),
  propertyType: z.enum(['hostel', 'guesthouse', 'apartment', 'resort', 'other']),
  roomCount: z.number().min(1),
  location: z.object({
    province: z.string(),
    district: z.string().optional(),
  }),
  currentSystem: z.string().optional(), // ใช้ระบบอะไรอยู่
  painPoints: z.string().optional(), // ปัญหาที่เจอ
  howDidYouHear: z.string().optional(),
  status: PilotSignupStatusEnum.default('new'),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PilotSignup = z.infer<typeof PilotSignupSchema>;

export const CreatePilotSignupSchema = PilotSignupSchema.omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePilotSignupInput = z.infer<typeof CreatePilotSignupSchema>;
```

---

## 7. Firestore Indexes

```
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyId", "order": "ASCENDING" },
        { "fieldPath": "dates.checkIn", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "rooms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "accessCodes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyId", "order": "ASCENDING" },
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 8. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isPropertyOwner(propertyId) {
      return get(/databases/$(database)/documents/properties/$(propertyId)).data.ownerId == request.auth.uid;
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
    }
    
    // Properties
    match /properties/{propertyId} {
      allow read: if isAuthenticated() && isPropertyOwner(propertyId);
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && isPropertyOwner(propertyId);
    }
    
    // Rooms
    match /rooms/{roomId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isPropertyOwner(resource.data.propertyId);
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create: if true; // Public can create booking
      allow update: if isAuthenticated() && isPropertyOwner(resource.data.propertyId);
    }
    
    // Access Codes
    match /accessCodes/{codeId} {
      allow read: if true; // For code validation
      allow write: if isAuthenticated() && isPropertyOwner(resource.data.propertyId);
    }
    
    // Pilot Signups (Public write)
    match /pilotSignups/{signupId} {
      allow create: if true;
      allow read, update: if isAuthenticated();
    }
  }
}
```
