# 🚀 Landing Page Specification

> **หน้า Landing สำหรับหา Pilot Customer**

## Overview

| รายการ | รายละเอียด |
|--------|------------|
| **Route** | `/` |
| **เป้าหมาย** | หา Pilot Customer สมัคร 10 ราย |
| **Target** | เจ้าของ Hostel/ที่พักขนาดเล็ก |
| **CTA** | สมัคร Pilot Program ฟรี 3 เดือน |

---

## Page Structure

```typescript
// src/client/pages/landing/LandingPage.tsx

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection /> {/* ใส่ทีหลังเมื่อมี Pilot */}
      <FAQSection />
      <PilotSignupSection />
      <Footer />
    </>
  );
}
```

---

## 1. Navbar Component

```typescript
// src/client/pages/landing/components/Navbar.tsx

interface NavbarProps {
  // No props needed
}

// Features:
// - Logo (ซ้าย)
// - Menu: หน้าหลัก, ฟีเจอร์, ราคา, ติดต่อ
// - CTA Button: "เข้าสู่ระบบ" (ขวา)
// - Mobile: Hamburger menu
// - Scroll behavior: เปลี่ยน background เมื่อ scroll

// Tailwind Classes:
// - Fixed top, z-50
// - bg-white/80 backdrop-blur เมื่อ scroll
// - Container max-w-7xl mx-auto
```

**Desktop:**
```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StayLock    หน้าหลัก  ฟีเจอร์  ราคา    [เข้าสู่ระบบ]│
└────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌────────────────────────────────────────────────────────────┐
│  [Logo] StayLock                                    [☰]   │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Hero Section

```typescript
// src/client/pages/landing/components/HeroSection.tsx

// Content:
const heroContent = {
  badge: "🎁 ทดลองใช้ฟรี 3 เดือน",
  headline: "ระบบจัดการที่พัก\nแบบไม่ต้องมี Front Desk",
  subheadline: "ลูกค้าจองเอง • เช็คอินด้วยรหัส • ลดพนักงาน",
  cta: "สมัครทดลองใช้ฟรี",
  secondaryCta: "ดูวิธีการทำงาน",
  trustBadges: [
    "✓ ไม่มีค่าใช้จ่าย",
    "✓ ไม่ต้องใส่บัตรเครดิต",
    "✓ ยกเลิกได้ทุกเมื่อ"
  ]
};

// Layout:
// - Full viewport height (min-h-screen)
// - Gradient background (blue-50 to white)
// - Text centered
// - CTA button prominent (blue-600, large)
```

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│               🎁 ทดลองใช้ฟรี 3 เดือน                       │
│                                                            │
│           ระบบจัดการที่พัก                                 │
│           แบบไม่ต้องมี Front Desk                          │
│                                                            │
│     ลูกค้าจองเอง • เช็คอินด้วยรหัส • ลดพนักงาน              │
│                                                            │
│        ┌──────────────────────────────────┐                │
│        │    สมัครทดลองใช้ฟรี    →         │                │
│        └──────────────────────────────────┘                │
│                                                            │
│               ดูวิธีการทำงาน ▼                              │
│                                                            │
│     ✓ ไม่มีค่าใช้จ่าย  ✓ ไม่ต้องใส่บัตรเครดิต              │
│                                                            │
│                      [Hero Image]                          │
│                   Dashboard Preview                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Pain Points Section

```typescript
// src/client/pages/landing/components/PainPointsSection.tsx

const painPoints = [
  {
    icon: "💰",
    title: "ค่าพนักงานสูง",
    description: "พนักงาน Front Desk คนละ 15,000-20,000 บาท/เดือน\nยังไม่รวม OT และประกันสังคม",
    stat: "15,000+",
    statLabel: "บาท/เดือน"
  },
  {
    icon: "🕐",
    title: "ต้องมีคนเฝ้า 24 ชม.",
    description: "ลูกค้ามาเช็คอินดึก ต้องมีคนรอ\nวันหยุดก็ต้องทำงาน",
    stat: "24/7",
    statLabel: "ไม่มีวันหยุด"
  },
  {
    icon: "📋",
    title: "จัดการยุ่งยาก",
    description: "ใช้ Excel หรือสมุดจด\nหาข้อมูลยาก ผิดพลาดบ่อย",
    stat: "40%",
    statLabel: "เวลาที่เสียไปกับงานเอกสาร"
  }
];

// Layout:
// - Section title: "ปัญหาที่เจ้าของที่พักเจอ"
// - 3 columns on desktop, stack on mobile
// - Each card has icon, title, description
```

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              ปัญหาที่เจ้าของที่พักเจอ                        │
│                                                            │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│   │     💰       │ │     🕐       │ │     📋       │       │
│   │ ค่าพนักงานสูง │ │ต้องเฝ้า 24 ชม.│ │ จัดการยุ่งยาก │       │
│   │              │ │              │ │              │       │
│   │ พนักงาน      │ │ ลูกค้ามาดึก   │ │ ใช้ Excel     │       │
│   │ 15,000+      │ │ ต้องมีคนรอ   │ │ ผิดพลาดบ่อย  │       │
│   │ บาท/เดือน    │ │              │ │              │       │
│   └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Solution Section

```typescript
// src/client/pages/landing/components/SolutionSection.tsx

const solutions = [
  {
    icon: "📱",
    title: "จองออนไลน์",
    description: "ลูกค้าจองและจ่ายเงินเองผ่านเว็บ\nไม่ต้องโทรถาม ไม่ต้องรอตอบ",
    features: ["หน้าจองสวยงาม", "รับชำระ PromptPay", "ยืนยันอัตโนมัติ"]
  },
  {
    icon: "🔐",
    title: "รหัสเข้าพัก",
    description: "ส่งรหัส 6 หลักให้ลูกค้าอัตโนมัติ\nเช็คอินเองได้ตลอด 24 ชม.",
    features: ["รหัสหมดอายุอัตโนมัติ", "ส่งทาง LINE/SMS", "ไม่ต้องมีคนรอ"]
  },
  {
    icon: "📊",
    title: "Dashboard",
    description: "ดูยอด Booking, รายได้, ห้องว่าง\nแบบ Real-time ทุกที่ทุกเวลา",
    features: ["ดูสถานะห้อง", "รายงานรายได้", "ปฏิทิน Booking"]
  }
];

// Layout:
// - Section title: "StayLock ช่วยคุณได้"
// - 3 columns with icons and feature list
// - Highlighted with blue gradient background
```

---

## 5. How It Works Section

```typescript
// src/client/pages/landing/components/HowItWorksSection.tsx

const steps = [
  {
    step: 1,
    title: "ลูกค้าเลือกห้อง",
    description: "ลูกค้าเข้าหน้าจองของคุณ\nเลือกวันที่และห้องที่ต้องการ"
  },
  {
    step: 2,
    title: "จ่ายเงินออนไลน์",
    description: "ชำระเงินผ่าน PromptPay\nยืนยันอัตโนมัติทันที"
  },
  {
    step: 3,
    title: "รับรหัสเข้าพัก",
    description: "ระบบส่งรหัส 6 หลักให้ลูกค้า\nผ่าน LINE หรือ SMS"
  },
  {
    step: 4,
    title: "เช็คอินด้วยรหัส",
    description: "ลูกค้ากดรหัสที่ประตู\nเข้าพักได้เลย ไม่ต้องรอ"
  }
];

// Layout:
// - Horizontal timeline on desktop
// - Vertical steps on mobile
// - Each step has number, title, description
```

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    ทำงานอย่างไร                            │
│                                                            │
│     ①──────────②──────────③──────────④                    │
│                                                            │
│   ลูกค้า       จ่ายเงิน     รับรหัส      เช็คอิน           │
│   เลือกห้อง   ออนไลน์    เข้าพัก      ด้วยรหัส            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Pricing Section

```typescript
// src/client/pages/landing/components/PricingSection.tsx

const pricingPlans = [
  {
    name: "Starter",
    price: 1500,
    period: "เดือน",
    rooms: "1-10 ห้อง",
    features: [
      "ระบบจัดการห้อง (PMS)",
      "หน้าจอง Direct Booking",
      "รหัสเข้าพัก Access Code",
      "แจ้งเตือน LINE",
      "รายงานพื้นฐาน"
    ],
    cta: "เลือกแพ็คเกจ",
    highlighted: false
  },
  {
    name: "Growth",
    price: 2500,
    period: "เดือน",
    rooms: "11-25 ห้อง",
    badge: "แนะนำ",
    features: [
      "ทุกอย่างใน Starter",
      "Smart Lock Integration",
      "ระบบแม่บ้าน Housekeeping",
      "Multi-user Access (3 คน)",
      "รายงานขั้นสูง"
    ],
    cta: "เลือกแพ็คเกจ",
    highlighted: true
  },
  {
    name: "Pro",
    price: 4500,
    period: "เดือน",
    rooms: "26-50 ห้อง",
    features: [
      "ทุกอย่างใน Growth",
      "เชื่อมต่อ OTA (Agoda, Booking)",
      "Dynamic Pricing",
      "Multi-user Access (10 คน)",
      "Priority Support"
    ],
    cta: "เลือกแพ็คเกจ",
    highlighted: false
  }
];

// Note at bottom:
const savingsNote = "ถูกกว่าค่าพนักงาน 10 เท่า • เริ่มต้นเพียงวันละ 50 บาท";
```

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                   ราคาที่คุ้มค่า                            │
│                                                            │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │  Starter   │  │  Growth    │  │    Pro     │          │
│   │            │  │  ★ แนะนำ   │  │            │          │
│   │  ฿1,500    │  │  ฿2,500    │  │  ฿4,500    │          │
│   │  /เดือน    │  │  /เดือน    │  │  /เดือน    │          │
│   │            │  │            │  │            │          │
│   │  1-10 ห้อง │  │ 11-25 ห้อง │  │ 26-50 ห้อง │          │
│   │            │  │            │  │            │          │
│   │  ✓ PMS     │  │ ✓ ทุกอย่าง │  │ ✓ ทุกอย่าง │          │
│   │  ✓ Booking │  │   ใน Starter│  │   ใน Growth│          │
│   │  ✓ Code    │  │ ✓ Smart Lock│  │ ✓ OTA      │          │
│   │  ✓ LINE    │  │ ✓ แม่บ้าน  │  │ ✓ Dynamic  │          │
│   │            │  │            │  │            │          │
│   │  [เลือก]   │  │  [เลือก]   │  │  [เลือก]   │          │
│   └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
│          ถูกกว่าค่าพนักงาน 10 เท่า                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 7. FAQ Section

```typescript
// src/client/pages/landing/components/FAQSection.tsx

const faqs = [
  {
    question: "ต้องติดตั้ง Smart Lock ด้วยหรือไม่?",
    answer: "ไม่จำเป็นครับ เริ่มต้นใช้รหัส Access Code ที่ส่งให้ลูกค้าได้เลย ถ้าต้องการ Smart Lock สามารถเพิ่มทีหลังได้"
  },
  {
    question: "รองรับการชำระเงินแบบไหนบ้าง?",
    answer: "รองรับ PromptPay QR Code, โอนธนาคาร และบัตรเครดิต"
  },
  {
    question: "ถ้ายกเลิกมีค่าใช้จ่ายไหม?",
    answer: "ไม่มีครับ สามารถยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด"
  },
  {
    question: "ใช้งานยากไหม?",
    answer: "ง่ายมากครับ ออกแบบมาสำหรับคนไม่เก่ง IT โดยเฉพาะ มีทีมช่วย Setup ให้ฟรี"
  },
  {
    question: "Pilot Program คืออะไร?",
    answer: "โปรแกรมทดลองใช้ฟรี 3 เดือน สำหรับที่พัก 10 รายแรก แลกกับ Feedback เพื่อพัฒนาระบบ"
  }
];

// Component: Accordion style
```

---

## 8. Pilot Signup Section

```typescript
// src/client/pages/landing/components/PilotSignupSection.tsx

// Form fields (from CreatePilotSignupSchema):
const formFields = [
  { name: "businessName", label: "ชื่อธุรกิจ/ที่พัก", type: "text", required: true },
  { name: "contactName", label: "ชื่อผู้ติดต่อ", type: "text", required: true },
  { name: "email", label: "อีเมล", type: "email", required: true },
  { name: "phone", label: "เบอร์โทรศัพท์", type: "tel", required: true },
  { name: "lineId", label: "LINE ID (ถ้ามี)", type: "text", required: false },
  { name: "propertyType", label: "ประเภทที่พัก", type: "select", required: true,
    options: ["hostel", "guesthouse", "apartment", "resort", "other"]
  },
  { name: "roomCount", label: "จำนวนห้อง", type: "number", required: true },
  { name: "province", label: "จังหวัด", type: "select", required: true },
  { name: "currentSystem", label: "ใช้ระบบอะไรอยู่ตอนนี้?", type: "text", required: false },
  { name: "painPoints", label: "ปัญหาที่เจอในการจัดการที่พัก?", type: "textarea", required: false },
  { name: "howDidYouHear", label: "รู้จักเราจากไหน?", type: "text", required: false }
];

// Success message after submit:
const successMessage = {
  title: "ขอบคุณที่สมัคร! 🎉",
  description: "เราจะติดต่อกลับภายใน 24 ชั่วโมง"
};
```

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│        🎁 ทดลองใช้ฟรี 3 เดือน (เหลืออีก 8 สิทธิ์)           │
│                                                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │                                                    │   │
│   │  ชื่อธุรกิจ:       [______________________]        │   │
│   │  ชื่อผู้ติดต่อ:     [______________________]        │   │
│   │  อีเมล:           [______________________]        │   │
│   │  เบอร์โทร:        [______________________]        │   │
│   │  LINE ID:         [______________________]        │   │
│   │  ประเภทที่พัก:     [Hostel           ▼]           │   │
│   │  จำนวนห้อง:       [____] ห้อง                     │   │
│   │  จังหวัด:         [เชียงใหม่         ▼]           │   │
│   │  ใช้ระบบอะไรอยู่:  [______________________]        │   │
│   │  ปัญหาที่เจอ:      [______________________]        │   │
│   │                   [______________________]        │   │
│   │                                                    │   │
│   │            [สมัคร Pilot Program ฟรี]               │   │
│   │                                                    │   │
│   └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Footer Component

```typescript
// src/client/pages/landing/components/Footer.tsx

const footerContent = {
  logo: "StayLock",
  tagline: "ระบบจัดการที่พักอัจฉริยะ",
  contact: {
    email: "contact@staylock.app",
    phone: "02-xxx-xxxx",
    line: "@staylock"
  },
  links: [
    { label: "หน้าหลัก", href: "/" },
    { label: "ฟีเจอร์", href: "#features" },
    { label: "ราคา", href: "#pricing" },
    { label: "FAQ", href: "#faq" }
  ],
  legal: [
    { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { label: "เงื่อนไขการใช้งาน", href: "/terms" }
  ],
  copyright: "© 2024 StayLock. All rights reserved."
};
```

---

## SEO & Meta Tags

```typescript
// src/client/pages/landing/LandingPage.tsx

const seoConfig = {
  title: "StayLock - ระบบจัดการที่พักแบบไม่ต้องมี Front Desk",
  description: "ลดต้นทุนพนักงาน ลูกค้าจองเอง เช็คอินด้วยรหัส สำหรับ Hostel และที่พักขนาดเล็ก ทดลองใช้ฟรี 3 เดือน",
  keywords: "ระบบจัดการโรงแรม, PMS, Hostel management, Access code, Smart lock",
  ogImage: "/images/og-image.jpg"
};
```

---

## Analytics Events

```typescript
// Track these events:
const analyticsEvents = {
  PAGE_VIEW: "landing_page_view",
  CTA_CLICK: "cta_click",
  PRICING_VIEW: "pricing_section_view",
  FORM_START: "pilot_form_start",
  FORM_SUBMIT: "pilot_form_submit",
  FORM_ERROR: "pilot_form_error"
};
```
