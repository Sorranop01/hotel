import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CalendarDays,
  BedDouble,
  Phone,
  Mail,
  CreditCard,
  KeyRound,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Banknote,
} from 'lucide-react';
import {
  useBooking,
  useConfirmBooking,
  useCheckIn,
  useCheckOut,
  useCancelBooking,
  useRecordPayment,
} from '../hooks/use-bookings';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select } from '../../../shared/components/ui/select';
import { Spinner } from '../../../shared/components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../shared/components/ui/modal';
import { formatCurrency, formatDate, formatDateTime } from '../../../shared/lib/utils';
import type { BookingStatus } from '@shared/constants';

const STATUS_BADGES: Record<BookingStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  pending: { label: 'รอยืนยัน', variant: 'warning' },
  confirmed: { label: 'ยืนยันแล้ว', variant: 'success' },
  checked_in: { label: 'เข้าพัก', variant: 'default' },
  checked_out: { label: 'เช็คเอาท์แล้ว', variant: 'secondary' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' },
};

const PAYMENT_STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: 'รอชำระ', variant: 'destructive' },
  partial: { label: 'ชำระบางส่วน', variant: 'warning' },
  paid: { label: 'ชำระแล้ว', variant: 'success' },
  refunded: { label: 'คืนเงินแล้ว', variant: 'default' },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
  transfer: 'โอนเงิน',
  card: 'บัตรเครดิต',
};

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'promptpay', label: 'พร้อมเพย์' },
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'card', label: 'บัตรเครดิต' },
];

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: booking, isLoading, error, refetch } = useBooking(id || '');
  const confirmBooking = useConfirmBooking();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelBooking = useCancelBooking();
  const recordPayment = useRecordPayment();

  const [actionModal, setActionModal] = useState<'confirm' | 'checkin' | 'checkout' | 'cancel' | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash' as 'cash' | 'promptpay' | 'transfer' | 'card',
  });

  const handleAction = async () => {
    if (!id || !actionModal) return;

    try {
      switch (actionModal) {
        case 'confirm':
          await confirmBooking.mutateAsync(id);
          break;
        case 'checkin':
          await checkIn.mutateAsync(id);
          break;
        case 'checkout':
          await checkOut.mutateAsync(id);
          break;
        case 'cancel':
          await cancelBooking.mutateAsync(id);
          break;
      }
      setActionModal(null);
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handlePayment = async () => {
    if (!id || paymentData.amount <= 0) return;

    try {
      await recordPayment.mutateAsync({
        id,
        amount: paymentData.amount,
        method: paymentData.method,
      });
      setPaymentModal(false);
      setPaymentData({ amount: 0, method: 'cash' });
      refetch();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'confirm': return 'ยืนยันการจอง';
      case 'checkin': return 'เช็คอิน';
      case 'checkout': return 'เช็คเอาท์';
      case 'cancel': return 'ยกเลิกการจอง';
      default: return '';
    }
  };

  const isPending = confirmBooking.isPending || checkIn.isPending || checkOut.isPending || cancelBooking.isPending;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">ไม่พบข้อมูลการจอง</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          กลับ
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_BADGES[booking.status];
  const paymentConfig = PAYMENT_STATUS_BADGES[booking.paymentStatus];
  const remainingAmount = booking.totalPrice - booking.paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{booking.bookingNumber}</h1>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <Badge variant={paymentConfig.variant}>{paymentConfig.label}</Badge>
            </div>
            <p className="text-muted-foreground">
              สร้างเมื่อ {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {booking.status === 'pending' && (
            <Button onClick={() => setActionModal('confirm')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              ยืนยัน
            </Button>
          )}

          {booking.status === 'confirmed' && (
            <Button onClick={() => setActionModal('checkin')}>
              <LogIn className="mr-2 h-4 w-4" />
              เช็คอิน
            </Button>
          )}

          {booking.status === 'checked_in' && (
            <Button onClick={() => setActionModal('checkout')}>
              <LogOut className="mr-2 h-4 w-4" />
              เช็คเอาท์
            </Button>
          )}

          {['pending', 'confirmed'].includes(booking.status) && (
            <Button variant="destructive" onClick={() => setActionModal('cancel')}>
              <XCircle className="mr-2 h-4 w-4" />
              ยกเลิก
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลผู้เข้าพัก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล</p>
                  <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">สัญชาติ</p>
                  <p className="font-medium">{booking.guest.nationality}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                    <p className="font-medium">{booking.guest.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">อีเมล</p>
                    <p className="font-medium">{booking.guest.email}</p>
                  </div>
                </div>
                {booking.guest.idNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">เลขบัตรประชาชน/พาสปอร์ต</p>
                    <p className="font-medium">{booking.guest.idNumber}</p>
                  </div>
                )}
                {booking.guest.specialRequests && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">คำขอพิเศษ</p>
                    <p className="font-medium">{booking.guest.specialRequests}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                รายละเอียดการเข้าพัก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">วันเช็คอิน</p>
                  <p className="font-medium">{formatDate(booking.checkIn)}</p>
                  <p className="text-sm text-muted-foreground">เวลา 14:00 น.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันเช็คเอาท์</p>
                  <p className="font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-sm text-muted-foreground">เวลา 12:00 น.</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">จำนวนคืน</p>
                  <p className="font-medium">{booking.nights} คืน</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้เข้าพัก</p>
                  <p className="font-medium">
                    {booking.adults} ผู้ใหญ่
                    {booking.children > 0 && `, ${booking.children} เด็ก`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Info */}
          {booking.room && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5" />
                  ข้อมูลห้องพัก
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-lg font-bold">ห้อง {booking.room.roomNumber}</p>
                    <p className="text-muted-foreground">{booking.room.name || booking.room.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(booking.roomPrice)}/คืน</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Access Code */}
          {booking.accessCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  รหัสเข้าห้อง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">รหัส 6 หลัก</p>
                    <p className="text-3xl font-bold tracking-widest text-primary">
                      {booking.accessCode}
                    </p>
                  </div>
                  {booking.accessCodeExpiry && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">ใช้ได้ถึง</p>
                      <p className="font-medium">{formatDateTime(booking.accessCodeExpiry)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle>บันทึก</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                การชำระเงิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ราคาห้อง ({booking.nights} คืน)</span>
                  <span>{formatCurrency(booking.roomPrice * booking.nights)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">รวมทั้งหมด</span>
                  <span className="font-bold text-primary">{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ชำระแล้ว</span>
                  <span className="font-medium text-green-600">{formatCurrency(booking.paidAmount)}</span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค้างชำระ</span>
                    <span className="font-medium text-destructive">{formatCurrency(remainingAmount)}</span>
                  </div>
                )}
                {booking.paymentMethod && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">วิธีการชำระ</span>
                    <span>{PAYMENT_METHOD_LABELS[booking.paymentMethod]}</span>
                  </div>
                )}
              </div>

              {remainingAmount > 0 && !['cancelled', 'checked_out'].includes(booking.status) && (
                <Button className="w-full" onClick={() => {
                  setPaymentData((prev) => ({ ...prev, amount: remainingAmount }));
                  setPaymentModal(true);
                }}>
                  <Banknote className="mr-2 h-4 w-4" />
                  บันทึกการชำระเงิน
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">แหล่งที่มา</span>
                <span>
                  {booking.source === 'walk-in' && 'Walk-in'}
                  {booking.source === 'phone' && 'โทรจอง'}
                  {booking.source === 'direct' && 'จองออนไลน์'}
                  {booking.source === 'other' && 'อื่นๆ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                <span>{formatDateTime(booking.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)}>
        <ModalHeader onClose={() => setActionModal(null)}>
          <ModalTitle>{actionModal && getActionLabel(actionModal)}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>
            คุณต้องการ{actionModal && getActionLabel(actionModal)}
            ของ <strong>{booking.guest.firstName} {booking.guest.lastName}</strong> ใช่หรือไม่?
          </p>
          {actionModal === 'confirm' && (
            <p className="mt-2 text-sm text-muted-foreground">
              ระบบจะสร้างรหัสเข้าห้องอัตโนมัติหลังยืนยัน
            </p>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModal(null)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAction}
            disabled={isPending}
            variant={actionModal === 'cancel' ? 'destructive' : 'default'}
          >
            {isPending ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Payment Modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)}>
        <ModalHeader onClose={() => setPaymentModal(false)}>
          <ModalTitle>บันทึกการชำระเงิน</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span>ยอดค้างชำระ</span>
              <span className="font-bold text-destructive">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentAmount">จำนวนเงิน (บาท)</Label>
            <Input
              id="paymentAmount"
              type="number"
              min={0}
              max={remainingAmount}
              value={paymentData.amount}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>วิธีการชำระ</Label>
            <Select
              options={PAYMENT_METHOD_OPTIONS}
              value={paymentData.method}
              onChange={(v) => setPaymentData((prev) => ({ ...prev, method: v as typeof prev.method }))}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setPaymentModal(false)} disabled={recordPayment.isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handlePayment}
            disabled={recordPayment.isPending || paymentData.amount <= 0}
          >
            {recordPayment.isPending ? 'กำลังบันทึก...' : `บันทึก ${formatCurrency(paymentData.amount)}`}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
