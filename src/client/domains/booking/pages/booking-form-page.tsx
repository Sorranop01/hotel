import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User, CreditCard } from 'lucide-react';
import { useCreateBooking } from '../hooks/use-bookings';
import { useProperties } from '../../property/hooks/use-properties';
import { useRooms } from '../../room/hooks/use-rooms';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select } from '../../../shared/components/ui/select';
import { Spinner } from '../../../shared/components/ui/spinner';
import { formatCurrency } from '../../../shared/lib/utils';

const SOURCE_OPTIONS = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'โทรจอง' },
  { value: 'direct', label: 'จองออนไลน์' },
  { value: 'other', label: 'อื่นๆ' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'ยังไม่ชำระ' },
  { value: 'cash', label: 'เงินสด' },
  { value: 'promptpay', label: 'พร้อมเพย์' },
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'card', label: 'บัตรเครดิต' },
];

export function BookingFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';

  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const createBooking = useCreateBooking();

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId);
  const [formData, setFormData] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialRequests: '',
    source: 'walk-in' as const,
    paymentMethod: '' as '' | 'cash' | 'promptpay' | 'transfer' | 'card',
    paidAmount: 0,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Refetch rooms when property changes
  useEffect(() => {
    if (selectedPropertyId !== propertyId) {
      setFormData((prev) => ({ ...prev, roomId: '' }));
    }
  }, [selectedPropertyId, propertyId]);

  const selectedRoom = useMemo(() => {
    return rooms?.find((r) => r.id === formData.roomId);
  }, [rooms, formData.roomId]);

  const nights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [formData.checkIn, formData.checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom || nights <= 0) return 0;
    return selectedRoom.pricePerNight * nights;
  }, [selectedRoom, nights]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!selectedPropertyId) errors.propertyId = 'กรุณาเลือกที่พัก';
    if (!formData.roomId) errors.roomId = 'กรุณาเลือกห้อง';
    if (!formData.checkIn) errors.checkIn = 'กรุณาเลือกวันเช็คอิน';
    if (!formData.checkOut) errors.checkOut = 'กรุณาเลือกวันเช็คเอาท์';
    if (nights <= 0) errors.checkOut = 'วันเช็คเอาท์ต้องหลังวันเช็คอิน';
    if (!formData.firstName.trim()) errors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) errors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.email.trim()) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'กรุณากรอกเบอร์โทร';
    } else if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createBooking.mutateAsync({
        propertyId: selectedPropertyId,
        roomId: formData.roomId,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        adults: formData.adults,
        children: formData.children,
        guest: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          nationality: 'Thai',
          specialRequests: formData.specialRequests || undefined,
        },
        source: formData.source,
        paymentMethod: formData.paymentMethod || undefined,
        paidAmount: formData.paidAmount || undefined,
        notes: formData.notes || undefined,
      });

      navigate(`/bookings?propertyId=${selectedPropertyId}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const isPending = createBooking.isPending;

  if (loadingProperties) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const propertyOptions = properties?.map((p) => ({ value: p.id, label: p.name })) || [];
  const roomOptions = rooms?.filter((r) => r.status === 'available').map((r) => ({
    value: r.id,
    label: `${r.roomNumber} - ${r.name || r.type} (${formatCurrency(r.pricePerNight)}/คืน)`,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">สร้างการจองใหม่</h1>
          <p className="text-muted-foreground">กรอกข้อมูลเพื่อสร้างการจอง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Property & Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  รายละเอียดการจอง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>ที่พัก</Label>
                    <Select
                      options={propertyOptions}
                      value={selectedPropertyId}
                      onChange={(v) => setSelectedPropertyId(v)}
                      placeholder="เลือกที่พัก"
                      error={formErrors.propertyId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label required>ห้องพัก</Label>
                    {loadingRooms ? (
                      <div className="flex h-9 items-center">
                        <Spinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <Select
                        options={roomOptions}
                        value={formData.roomId}
                        onChange={handleSelectChange('roomId')}
                        placeholder={!selectedPropertyId ? 'เลือกที่พักก่อน' : roomOptions.length === 0 ? 'ไม่มีห้องว่าง' : 'เลือกห้อง'}
                        disabled={!selectedPropertyId || roomOptions.length === 0}
                        error={formErrors.roomId}
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn" required>วันเช็คอิน</Label>
                    <Input
                      id="checkIn"
                      name="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      error={formErrors.checkIn}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOut" required>วันเช็คเอาท์</Label>
                    <Input
                      id="checkOut"
                      name="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={handleChange}
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      error={formErrors.checkOut}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adults">ผู้ใหญ่</Label>
                    <Input
                      id="adults"
                      name="adults"
                      type="number"
                      min={1}
                      value={formData.adults}
                      onChange={handleChange}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children">เด็ก</Label>
                    <Input
                      id="children"
                      name="children"
                      type="number"
                      min={0}
                      value={formData.children}
                      onChange={handleChange}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>แหล่งที่มา</Label>
                  <Select
                    options={SOURCE_OPTIONS}
                    value={formData.source}
                    onChange={handleSelectChange('source')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Guest Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลผู้เข้าพัก
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" required>ชื่อ</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="ชื่อ"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={formErrors.firstName}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" required>นามสกุล</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="นามสกุล"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={formErrors.lastName}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" required>อีเมล</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={formErrors.email}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" required>เบอร์โทรศัพท์</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="0812345678"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={formErrors.phoneNumber}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">คำขอพิเศษ</Label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="เช่น ต้องการห้องชั้น 1, ต้องการเตียงเสริม..."
                    value={formData.specialRequests}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  การชำระเงิน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>วิธีการชำระเงิน</Label>
                    <Select
                      options={PAYMENT_METHOD_OPTIONS}
                      value={formData.paymentMethod}
                      onChange={handleSelectChange('paymentMethod')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">จำนวนเงินที่ชำระ (บาท)</Label>
                    <Input
                      id="paidAmount"
                      name="paidAmount"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.paidAmount}
                      onChange={handleChange}
                      disabled={isPending || !formData.paymentMethod}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="บันทึกสำหรับพนักงาน..."
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>สรุปการจอง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoom ? (
                  <>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="font-medium">ห้อง {selectedRoom.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRoom.name || selectedRoom.type}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ราคาต่อคืน</span>
                        <span>{formatCurrency(selectedRoom.pricePerNight)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">จำนวนคืน</span>
                        <span>{nights} คืน</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ผู้เข้าพัก</span>
                        <span>{formData.adults} ผู้ใหญ่ {formData.children > 0 && `, ${formData.children} เด็ก`}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>รวมทั้งหมด</span>
                        <span className="text-primary">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    เลือกห้องพักเพื่อดูราคา
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isPending || !selectedRoom || nights <= 0}>
                  {isPending ? 'กำลังสร้าง...' : 'สร้างการจอง'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                >
                  ยกเลิก
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
