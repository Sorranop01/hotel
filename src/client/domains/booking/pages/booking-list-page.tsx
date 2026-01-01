import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  CalendarDays,
  Search,
  Eye,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
} from 'lucide-react';
import { useBookings, useConfirmBooking, useCheckIn, useCheckOut, useCancelBooking } from '../hooks/use-bookings';
import { useProperties } from '../../property/hooks/use-properties';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Select } from '../../../shared/components/ui/select';
import { Input } from '../../../shared/components/ui/input';
import { Spinner } from '../../../shared/components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../shared/components/ui/modal';
import { formatCurrency, formatDate } from '../../../shared/lib/utils';
import type { BookingStatus } from '@shared/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'checked_in', label: 'เช็คอินแล้ว' },
  { value: 'checked_out', label: 'เช็คเอาท์แล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

const STATUS_BADGES: Record<BookingStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  pending: { label: 'รอยืนยัน', variant: 'warning' },
  confirmed: { label: 'ยืนยันแล้ว', variant: 'success' },
  checked_in: { label: 'เข้าพัก', variant: 'default' },
  checked_out: { label: 'เช็คเอาท์', variant: 'secondary' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' },
};

const PAYMENT_STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: 'รอชำระ', variant: 'destructive' },
  partial: { label: 'ชำระบางส่วน', variant: 'warning' },
  paid: { label: 'ชำระแล้ว', variant: 'success' },
  refunded: { label: 'คืนเงินแล้ว', variant: 'default' },
};

export function BookingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const statusFilter = searchParams.get('status') || '';
  const [guestSearch, setGuestSearch] = useState('');

  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: bookings, isLoading: loadingBookings, refetch } = useBookings({
    propertyId,
    status: statusFilter as BookingStatus | undefined,
    guestName: guestSearch || undefined,
  });

  const confirmBooking = useConfirmBooking();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelBooking = useCancelBooking();

  const [actionModal, setActionModal] = useState<{
    type: 'confirm' | 'checkin' | 'checkout' | 'cancel';
    bookingId: string;
    guestName: string;
  } | null>(null);

  const handlePropertyChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('propertyId', value);
    setSearchParams(params);
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    setSearchParams(params);
  };

  const handleAction = async () => {
    if (!actionModal) return;

    try {
      switch (actionModal.type) {
        case 'confirm':
          await confirmBooking.mutateAsync(actionModal.bookingId);
          break;
        case 'checkin':
          await checkIn.mutateAsync(actionModal.bookingId);
          break;
        case 'checkout':
          await checkOut.mutateAsync(actionModal.bookingId);
          break;
        case 'cancel':
          await cancelBooking.mutateAsync(actionModal.bookingId);
          break;
      }
      setActionModal(null);
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
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

  if (loadingProperties) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const propertyOptions = properties?.map((p) => ({ value: p.id, label: p.name })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">การจอง</h1>
          <p className="text-muted-foreground">จัดการการจองทั้งหมด</p>
        </div>
        {propertyId && (
          <Button asChild>
            <Link to={`/bookings/new?propertyId=${propertyId}`}>
              <Plus className="mr-2 h-4 w-4" />
              สร้างการจอง
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">ที่พัก</label>
              <Select
                options={propertyOptions}
                value={propertyId}
                onChange={handlePropertyChange}
                placeholder="เลือกที่พัก"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">สถานะ</label>
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={handleStatusChange}
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">ค้นหาชื่อผู้เข้าพัก</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="ชื่อหรือนามสกุล..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {!propertyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">เลือกที่พัก</h3>
            <p className="mt-2 text-muted-foreground">
              กรุณาเลือกที่พักเพื่อดูรายการจอง
            </p>
          </CardContent>
        </Card>
      ) : loadingBookings ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">ไม่มีการจอง</h3>
            <p className="mt-2 text-muted-foreground">
              {statusFilter ? 'ไม่พบการจองที่ตรงกับตัวกรอง' : 'ยังไม่มีการจองในระบบ'}
            </p>
            <Button className="mt-4" asChild>
              <Link to={`/bookings/new?propertyId=${propertyId}`}>
                <Plus className="mr-2 h-4 w-4" />
                สร้างการจอง
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              รายการจอง ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">เลขที่จอง</th>
                    <th className="pb-3 font-medium">ผู้เข้าพัก</th>
                    <th className="pb-3 font-medium">วันที่</th>
                    <th className="pb-3 font-medium">ราคา</th>
                    <th className="pb-3 font-medium">สถานะ</th>
                    <th className="pb-3 font-medium">การชำระเงิน</th>
                    <th className="pb-3 font-medium text-right">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => {
                    const statusConfig = STATUS_BADGES[booking.status];
                    const paymentConfig = PAYMENT_STATUS_BADGES[booking.paymentStatus];

                    return (
                      <tr key={booking.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {booking.bookingNumber}
                          </Link>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">
                              {booking.guest.firstName} {booking.guest.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.guest.phoneNumber}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-sm">
                            <p>{formatDate(booking.checkIn)}</p>
                            <p className="text-muted-foreground">
                              ถึง {formatDate(booking.checkOut)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ({booking.nights} คืน)
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                          {booking.paidAmount > 0 && booking.paidAmount < booking.totalPrice && (
                            <p className="text-sm text-muted-foreground">
                              ชำระแล้ว {formatCurrency(booking.paidAmount)}
                            </p>
                          )}
                        </td>
                        <td className="py-4">
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={paymentConfig.variant}>
                            {paymentConfig.label}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/bookings/${booking.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {booking.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActionModal({
                                  type: 'confirm',
                                  bookingId: booking.id,
                                  guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                                })}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}

                            {booking.status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActionModal({
                                  type: 'checkin',
                                  bookingId: booking.id,
                                  guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                                })}
                              >
                                <LogIn className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}

                            {booking.status === 'checked_in' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActionModal({
                                  type: 'checkout',
                                  bookingId: booking.id,
                                  guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                                })}
                              >
                                <LogOut className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}

                            {['pending', 'confirmed'].includes(booking.status) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActionModal({
                                  type: 'cancel',
                                  bookingId: booking.id,
                                  guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
                                })}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)}>
        <ModalHeader onClose={() => setActionModal(null)}>
          <ModalTitle>{actionModal && getActionLabel(actionModal.type)}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>
            คุณต้องการ{actionModal && getActionLabel(actionModal.type)}
            ของ <strong>{actionModal?.guestName}</strong> ใช่หรือไม่?
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModal(null)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAction}
            disabled={isPending}
            variant={actionModal?.type === 'cancel' ? 'destructive' : 'default'}
          >
            {isPending ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
