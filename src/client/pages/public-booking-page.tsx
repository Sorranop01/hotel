import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, differenceInDays, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  BedDouble,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../shared/lib/api';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/ui/input';
import { Label } from '../shared/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/components/ui/card';
import { Badge } from '../shared/components/ui/badge';
import { Spinner } from '../shared/components/ui/spinner';
import { formatCurrency } from '../shared/lib/utils';
import type { Property } from '@shared/schemas/property.schema';
import type { Room } from '@shared/schemas/room.schema';

interface PropertyPublicData {
  property: Property;
  rooms: Room[];
}

interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  adults: number;
  children: number;
  specialRequests: string;
}

interface BookingResult {
  success: boolean;
  bookingNumber: string;
  accessCode?: string;
  message: string;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  standard: 'ห้องมาตรฐาน',
  deluxe: 'ห้องดีลักซ์',
  suite: 'ห้องสวีท',
  dormitory: 'ห้องรวม',
};

export function PublicBookingPage() {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [formData, setFormData] = useState<BookingFormData>({
    roomId: '',
    checkIn: today,
    checkOut: tomorrow,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    adults: 1,
    children: 0,
    specialRequests: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  // Fetch property data
  const { data, isLoading, error } = useQuery<PropertyPublicData>({
    queryKey: ['property-public', propertySlug],
    queryFn: async () => {
      const response = await api.get(`/properties/slug/${propertySlug}`);
      return response as unknown as PropertyPublicData;
    },
    enabled: !!propertySlug,
  });

  // Check room availability
  const { data: availableRooms, isLoading: checkingAvailability } = useQuery<Room[]>({
    queryKey: ['available-rooms', data?.property.id, formData.checkIn, formData.checkOut],
    queryFn: async () => {
      const response = await api.get('/rooms/available', {
        params: {
          propertyId: data?.property.id,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
        },
      });
      return response as unknown as Room[];
    },
    enabled: !!data?.property.id && !!formData.checkIn && !!formData.checkOut,
  });

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (bookingData: BookingFormData) => {
      const response = await api.post('/bookings', {
        propertyId: data?.property.id,
        roomId: bookingData.roomId,
        checkIn: new Date(bookingData.checkIn),
        checkOut: new Date(bookingData.checkOut),
        guest: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phoneNumber: bookingData.phoneNumber,
        },
        adults: bookingData.adults,
        children: bookingData.children,
        specialRequests: bookingData.specialRequests || undefined,
      });
      return response as unknown as BookingResult;
    },
    onSuccess: (result) => {
      setBookingResult(result);
      setStep('success');
    },
  });

  const nights = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'กรุณากรอกเบอร์โทร';
    else if (!/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setFormData({ ...formData, roomId: room.id });
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createBooking.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">ไม่พบที่พัก</h2>
            <p className="text-muted-foreground mb-4">
              ไม่พบที่พักที่คุณค้นหา กรุณาตรวจสอบลิงก์อีกครั้ง
            </p>
            <Button asChild>
              <Link to="/">กลับหน้าแรก</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { property } = data;

  // Success step
  if (step === 'success' && bookingResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">จองสำเร็จ!</h1>
              <p className="text-muted-foreground mb-6">
                การจองของคุณได้รับการบันทึกแล้ว
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="grid gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">เลขที่การจอง</span>
                    <p className="font-semibold text-lg">{bookingResult.bookingNumber}</p>
                  </div>
                  {bookingResult.accessCode && (
                    <div>
                      <span className="text-sm text-muted-foreground">รหัสเข้าห้อง</span>
                      <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                        {bookingResult.accessCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {bookingResult.accessCode
                  ? 'กรุณาเก็บรหัสนี้ไว้ สำหรับใช้เข้าห้องพักในวันที่เช็คอิน'
                  : 'ทางที่พักจะส่งรหัสเข้าห้องให้คุณทางอีเมลหลังยืนยันการจอง'
                }
              </p>

              <Button asChild className="w-full">
                <Link to="/">กลับหน้าแรก</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <span className="font-semibold">StayLock</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Property Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{property.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </span>
                  {property.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {property.phoneNumber}
                    </span>
                  )}
                  {property.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {property.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 'select' && (
          <>
            {/* Date Selection */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  เลือกวันที่เข้าพัก
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">วันเช็คอิน</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      min={today}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">วันเช็คเอาท์</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      min={formData.checkIn || today}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    ระยะเวลาเข้าพัก: <span className="font-semibold">{nights} คืน</span>
                    {' '}({format(new Date(formData.checkIn), 'd MMM yyyy', { locale: th })} - {format(new Date(formData.checkOut), 'd MMM yyyy', { locale: th })})
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5" />
                  เลือกห้องพัก
                </CardTitle>
                <CardDescription>
                  {checkingAvailability ? 'กำลังตรวจสอบห้องว่าง...' : `พบห้องว่าง ${availableRooms?.length || 0} ห้อง`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkingAvailability ? (
                  <div className="py-8 flex justify-center">
                    <Spinner />
                  </div>
                ) : availableRooms && availableRooms.length > 0 ? (
                  <div className="space-y-4">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{room.name}</h3>
                              <Badge variant="secondary">
                                {ROOM_TYPE_LABELS[room.type] || room.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                รองรับ {room.capacity} คน
                              </span>
                              {room.bedType && (
                                <span className="flex items-center gap-1">
                                  <BedDouble className="h-4 w-4" />
                                  {room.bedType}
                                </span>
                              )}
                            </div>
                            {room.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {room.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {formatCurrency(room.price)}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              / คืน
                            </div>
                            <Button onClick={() => handleSelectRoom(room)}>
                              เลือกห้องนี้
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <BedDouble className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>ไม่มีห้องว่างในช่วงวันที่เลือก</p>
                    <p className="text-sm">กรุณาเลือกวันอื่น</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {step === 'form' && selectedRoom && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลผู้เข้าพัก</CardTitle>
                  <CardDescription>
                    กรุณากรอกข้อมูลให้ครบถ้วน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" required>ชื่อ</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          error={errors.firstName}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" required>นามสกุล</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          error={errors.lastName}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" required>อีเมล</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          error={errors.email}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" required>เบอร์โทรศัพท์</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="0812345678"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          error={errors.phoneNumber}
                        />
                        {errors.phoneNumber && (
                          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adults">จำนวนผู้ใหญ่</Label>
                        <Input
                          id="adults"
                          type="number"
                          min={1}
                          max={selectedRoom.capacity}
                          value={formData.adults}
                          onChange={(e) => handleInputChange('adults', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="children">จำนวนเด็ก</Label>
                        <Input
                          id="children"
                          type="number"
                          min={0}
                          value={formData.children}
                          onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">คำขอพิเศษ (ถ้ามี)</Label>
                      <textarea
                        id="specialRequests"
                        className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="เช่น ต้องการห้องชั้นล่าง, มาถึงดึก..."
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep('select');
                          setSelectedRoom(null);
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        เลือกห้องใหม่
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createBooking.isPending}
                      >
                        {createBooking.isPending ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                      </Button>
                    </div>

                    {createBooking.error && (
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                        เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>สรุปการจอง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">ห้องพัก</span>
                    <p className="font-semibold">{selectedRoom.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {ROOM_TYPE_LABELS[selectedRoom.type] || selectedRoom.type}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">เช็คอิน</span>
                        <p className="font-medium">
                          {format(new Date(formData.checkIn), 'd MMM yyyy', { locale: th })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          หลัง {property.checkInTime} น.
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">เช็คเอาท์</span>
                        <p className="font-medium">
                          {format(new Date(formData.checkOut), 'd MMM yyyy', { locale: th })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ก่อน {property.checkOutTime} น.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ราคาห้อง x {nights} คืน</span>
                      <span>{formatCurrency(selectedRoom.price)} x {nights}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>รวมทั้งหมด</span>
                      <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
