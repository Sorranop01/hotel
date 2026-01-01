import { Link } from 'react-router-dom';
import {
  Building2,
  KeyRound,
  CalendarCheck,
  Shield,
  Clock,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../shared/components/ui/button';
import { Card, CardContent } from '../shared/components/ui/card';

const features = [
  {
    icon: KeyRound,
    title: 'รหัสเข้าห้องอัตโนมัติ',
    description: 'ผู้เข้าพักได้รับรหัสเข้าห้องทันทีหลังจองยืนยัน ไม่ต้องรอรับกุญแจ',
  },
  {
    icon: CalendarCheck,
    title: 'จองออนไลน์ 24 ชม.',
    description: 'ระบบจองห้องพักออนไลน์ที่ทำงานตลอด 24 ชั่วโมง',
  },
  {
    icon: Shield,
    title: 'ปลอดภัยและมั่นใจ',
    description: 'รหัสเข้าห้องมีอายุตามช่วงเวลาเข้าพัก เพิ่มความปลอดภัย',
  },
  {
    icon: Clock,
    title: 'เช็คอิน-เช็คเอาท์ง่าย',
    description: 'ผู้เข้าพักสามารถเช็คอินด้วยตัวเองผ่านรหัสที่ได้รับ',
  },
  {
    icon: Smartphone,
    title: 'จัดการผ่านมือถือ',
    description: 'เจ้าของที่พักจัดการทุกอย่างได้จากมือถือ ทุกที่ทุกเวลา',
  },
  {
    icon: Building2,
    title: 'รองรับหลายที่พัก',
    description: 'บริหารจัดการที่พักหลายแห่งในระบบเดียว',
  },
];

const benefits = [
  'ลดค่าใช้จ่ายพนักงานต้อนรับ',
  'ผู้เข้าพักเช็คอินได้ตลอด 24 ชม.',
  'รหัสเข้าห้องเปลี่ยนทุกการจอง',
  'ดูสถานะห้องพักแบบ Real-time',
  'รายงานรายได้และสถิติ',
  'รองรับการชำระเงินหลายช่องทาง',
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">StayLock</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild>
              <Link to="/register">สมัครใช้งาน</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ระบบจัดการที่พัก
              <span className="text-primary"> ไม่ต้องมี Front Desk</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              StayLock ช่วยให้ที่พักขนาดเล็กสามารถให้บริการได้แบบอัตโนมัติ
              ผู้เข้าพักได้รับรหัสเข้าห้องทันที ไม่ต้องรอพนักงานต้อนรับ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  เริ่มต้นใช้งานฟรี
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">ฟีเจอร์ที่ครบครัน</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ทุกสิ่งที่คุณต้องการสำหรับการจัดการที่พักแบบไม่ต้องมีพนักงานต้อนรับ
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                เหมาะสำหรับที่พักขนาดเล็ก
              </h2>
              <p className="text-gray-600 mb-8">
                StayLock ออกแบบมาสำหรับโฮสเทล เกสต์เฮาส์ อพาร์ทเมนท์รายวัน
                ที่มี 5-20 ห้อง ช่วยลดภาระงานและค่าใช้จ่าย
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary">5-20</div>
                <div className="text-gray-600">ห้องพัก</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-gray-600">รับจองตลอดเวลา</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-gray-600">พนักงานต้อนรับ</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-sm text-gray-600">หลักรหัสเข้าห้อง</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-gray-600">อัตโนมัติ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            พร้อมเปลี่ยนที่พักของคุณให้เป็นอัตโนมัติ?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            เริ่มต้นใช้งาน StayLock วันนี้ ไม่มีค่าใช้จ่ายในการทดลองใช้
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">
              สมัครใช้งานฟรี
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold">StayLock</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} StayLock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
