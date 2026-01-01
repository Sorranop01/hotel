# 🔌 API Specification

> **REST API Endpoints for StayLock**

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.staylock.app/api`

## Authentication

ใช้ Firebase Auth ID Token ส่งใน Header:
```
Authorization: Bearer <firebase_id_token>
```

---

## 1. Auth Endpoints

### POST `/api/auth/register`
สมัครสมาชิกใหม่

**Request:**
```json
{
  "email": "somchai@email.com",
  "password": "securePassword123",
  "displayName": "สมชาย ใจดี",
  "phone": "0891234567"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "somchai@email.com",
      "displayName": "สมชาย ใจดี"
    },
    "token": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

### POST `/api/auth/login`
เข้าสู่ระบบ

**Request:**
```json
{
  "email": "somchai@email.com",
  "password": "securePassword123"
}
```

### GET `/api/auth/me`
ดูข้อมูลผู้ใช้ปัจจุบัน (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "somchai@email.com",
    "displayName": "สมชาย ใจดี",
    "phone": "0891234567",
    "role": "owner"
  }
}
```

---

## 2. Properties Endpoints

### GET `/api/properties`
ดูรายการที่พักของผู้ใช้ (🔒 Auth Required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_xyz789",
      "name": "สบายดี โฮสเทล",
      "slug": "sabaidee-hostel",
      "type": "hostel",
      "totalRooms": 10,
      "isActive": true
    }
  ]
}
```

### GET `/api/properties/:id`
ดูรายละเอียดที่พัก (🔒 Auth Required)

### POST `/api/properties`
สร้างที่พักใหม่ (🔒 Auth Required)

**Request:**
```json
{
  "name": "สบายดี โฮสเทล",
  "type": "hostel",
  "description": "ที่พักใจกลางเมือง",
  "address": {
    "street": "123 ถ.เจริญเมือง",
    "district": "เมือง",
    "province": "เชียงใหม่",
    "postalCode": "50000"
  },
  "contact": {
    "phone": "0891234567",
    "email": "sabaidee@email.com"
  }
}
```

### PUT `/api/properties/:id`
แก้ไขที่พัก (🔒 Auth Required)

### DELETE `/api/properties/:id`
ลบที่พัก (🔒 Auth Required)

---

## 3. Rooms Endpoints

### GET `/api/properties/:propertyId/rooms`
ดูรายการห้องของที่พัก (🔒 Auth Required)

**Query Params:**
- `status`: filter by status (available, occupied, etc.)
- `type`: filter by room type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "room_001",
      "name": "101",
      "type": "standard",
      "status": "available",
      "pricing": {
        "basePrice": 500
      }
    }
  ]
}
```

### GET `/api/rooms/:id`
ดูรายละเอียดห้อง (🔒 Auth Required)

### POST `/api/properties/:propertyId/rooms`
สร้างห้องใหม่ (🔒 Auth Required)

**Request:**
```json
{
  "name": "101",
  "floor": 1,
  "type": "standard",
  "capacity": {
    "adults": 2,
    "children": 1
  },
  "beds": [
    { "type": "double", "count": 1 }
  ],
  "pricing": {
    "basePrice": 500,
    "weekendPrice": 600
  },
  "amenities": ["aircon", "wifi", "tv"]
}
```

### PUT `/api/rooms/:id`
แก้ไขห้อง (🔒 Auth Required)

### PATCH `/api/rooms/:id/status`
เปลี่ยนสถานะห้อง (🔒 Auth Required)

**Request:**
```json
{
  "status": "cleaning",
  "note": "รอแม่บ้านทำความสะอาด"
}
```

### DELETE `/api/rooms/:id`
ลบห้อง (🔒 Auth Required)

---

## 4. Bookings Endpoints

### GET `/api/properties/:propertyId/bookings`
ดูรายการ Booking (🔒 Auth Required)

**Query Params:**
- `status`: filter by status
- `from`: start date (YYYY-MM-DD)
- `to`: end date (YYYY-MM-DD)
- `page`: page number
- `limit`: items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "book_abc123",
      "bookingNumber": "BK-20240115-001",
      "guest": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "dates": {
        "checkIn": "2024-01-20",
        "checkOut": "2024-01-22",
        "nights": 2
      },
      "status": "confirmed",
      "pricing": {
        "grandTotal": 1070
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### GET `/api/bookings/:id`
ดูรายละเอียด Booking (🔒 Auth Required)

### POST `/api/bookings` (Public)
สร้าง Booking ใหม่ (สำหรับ Guest)

**Request:**
```json
{
  "propertyId": "prop_xyz789",
  "roomId": "room_001",
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@email.com",
    "phone": "0891234567",
    "specialRequests": "ขอห้องชั้น 1"
  },
  "checkIn": "2024-01-20",
  "checkOut": "2024-01-22",
  "adults": 2,
  "children": 0
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "book_abc123",
    "bookingNumber": "BK-20240115-001",
    "status": "pending",
    "pricing": {
      "grandTotal": 1070
    },
    "paymentUrl": "https://promptpay.io/..."
  }
}
```

### PUT `/api/bookings/:id`
แก้ไข Booking (🔒 Auth Required)

### PATCH `/api/bookings/:id/status`
เปลี่ยนสถานะ Booking (🔒 Auth Required)

**Request:**
```json
{
  "status": "checked_in"
}
```

### PATCH `/api/bookings/:id/payment`
บันทึกการชำระเงิน (🔒 Auth Required)

**Request:**
```json
{
  "status": "paid",
  "method": "promptpay",
  "amount": 1070,
  "transactionRef": "PP-123456"
}
```

### DELETE `/api/bookings/:id`
ยกเลิก Booking (🔒 Auth Required)

---

## 5. Access Codes Endpoints

### GET `/api/properties/:propertyId/access-codes`
ดูรายการ Access Codes (🔒 Auth Required)

**Query Params:**
- `type`: guest, staff, maintenance
- `active`: true/false
- `bookingId`: filter by booking

### POST `/api/access-codes/generate`
สร้าง Access Code ใหม่ (🔒 Auth Required)

**Request:**
```json
{
  "propertyId": "prop_xyz789",
  "bookingId": "book_abc123",
  "roomId": "room_001",
  "type": "guest",
  "name": "John Doe",
  "validFrom": "2024-01-20T12:00:00Z",
  "validUntil": "2024-01-22T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "code_xyz123",
    "code": "482916",
    "validFrom": "2024-01-20T12:00:00Z",
    "validUntil": "2024-01-22T14:00:00Z"
  }
}
```

### POST `/api/access-codes/validate` (Public)
ตรวจสอบ Access Code

**Request:**
```json
{
  "propertyId": "prop_xyz789",
  "code": "482916"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "roomName": "101",
    "guestName": "John Doe",
    "checkOut": "2024-01-22T12:00:00Z"
  }
}
```

### POST `/api/access-codes/:id/send`
ส่ง Access Code (🔒 Auth Required)

**Request:**
```json
{
  "channel": "line",
  "recipient": "0891234567"
}
```

### DELETE `/api/access-codes/:id`
ยกเลิก Access Code (🔒 Auth Required)

---

## 6. Dashboard Endpoints

### GET `/api/dashboard/stats`
ดูสถิติภาพรวม (🔒 Auth Required)

**Query Params:**
- `propertyId`: required
- `period`: today, week, month, year

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRooms": 10,
      "availableRooms": 6,
      "occupiedRooms": 3,
      "cleaningRooms": 1
    },
    "bookings": {
      "today": 2,
      "upcoming": 5,
      "checkInsToday": 1,
      "checkOutsToday": 2
    },
    "revenue": {
      "today": 1500,
      "thisWeek": 8500,
      "thisMonth": 35000
    },
    "occupancyRate": 30
  }
}
```

### GET `/api/dashboard/calendar`
ดูปฏิทิน Booking (🔒 Auth Required)

**Query Params:**
- `propertyId`: required
- `month`: YYYY-MM

---

## 7. Pilot Signup Endpoint

### POST `/api/pilot-signup` (Public)
สมัคร Pilot Program

**Request:**
```json
{
  "businessName": "สบายดี โฮสเทล",
  "contactName": "สมชาย ใจดี",
  "email": "somchai@email.com",
  "phone": "0891234567",
  "lineId": "@sabaidee",
  "propertyType": "hostel",
  "roomCount": 10,
  "location": {
    "province": "เชียงใหม่",
    "district": "เมือง"
  },
  "currentSystem": "Excel",
  "painPoints": "ต้องมีคนเฝ้า 24 ชม.",
  "howDidYouHear": "Facebook"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "ขอบคุณที่สนใจ! เราจะติดต่อกลับภายใน 24 ชั่วโมง"
}
```

---

## 8. Public Property Endpoints

### GET `/api/public/properties/:slug`
ดูข้อมูลที่พักสำหรับ Guest

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "สบายดี โฮสเทล",
    "description": "...",
    "images": [],
    "amenities": [],
    "policies": {
      "checkInTime": "14:00",
      "checkOutTime": "12:00"
    }
  }
}
```

### GET `/api/public/properties/:slug/availability`
ดูห้องว่าง

**Query Params:**
- `checkIn`: YYYY-MM-DD
- `checkOut`: YYYY-MM-DD
- `adults`: number
- `children`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "room_001",
      "name": "101",
      "type": "standard",
      "capacity": { "adults": 2 },
      "pricing": {
        "perNight": 500,
        "total": 1000,
        "nights": 2
      },
      "available": true
    }
  ]
}
```

---

## Error Responses

**Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้อง",
    "details": [
      { "field": "email", "message": "อีเมลไม่ถูกต้อง" }
    ]
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | ข้อมูลไม่ถูกต้อง |
| `UNAUTHORIZED` | 401 | ไม่ได้ login |
| `FORBIDDEN` | 403 | ไม่มีสิทธิ์ |
| `NOT_FOUND` | 404 | ไม่พบข้อมูล |
| `CONFLICT` | 409 | ข้อมูลซ้ำ |
| `INTERNAL_ERROR` | 500 | Server Error |
