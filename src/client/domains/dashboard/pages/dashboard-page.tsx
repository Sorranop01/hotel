import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  CalendarDays,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Spinner } from '../../../shared/components/ui/spinner';
import { formatCurrency, formatDate } from '../../../shared/lib/utils';
import { useDashboardStats, useTodayBookings } from '../hooks/use-dashboard';

export function DashboardPage() {
  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
    refetch: refetchStats
  } = useDashboardStats();

  const {
    data: todayBookings,
    isLoading: loadingBookings,
    refetch: refetchBookings
  } = useTodayBookings();

  const loading = loadingStats || loadingBookings;

  const handleRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมของที่พักและการจองวันนี้</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ที่พักทั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.properties}</div>
            <p className="text-xs text-muted-foreground">
              ที่พักที่กำลังจัดการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ห้องพักว่าง</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.rooms.available}/{stats?.rooms.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.rooms.occupied} ห้องมีผู้เข้าพัก
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">การจองวันนี้</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookings.today}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                {stats?.bookings.checkIns} เข้าพัก
              </span>
              <span className="flex items-center text-orange-600">
                <ArrowDownRight className="h-3 w-3" />
                {stats?.bookings.checkOuts} ออก
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รายได้เดือนนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.revenue.month || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              วันนี้: {formatCurrency(stats?.revenue.today || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>การจองวันนี้</CardTitle>
            <p className="text-sm text-muted-foreground">
              รายการเช็คอิน/เช็คเอาท์วันนี้
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/bookings">ดูทั้งหมด</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!todayBookings || todayBookings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              ไม่มีการจองวันนี้
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-sm text-muted-foreground">
                        ห้อง {booking.roomNumber} • {booking.bookingNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={booking.type === 'checkin' ? 'success' : 'warning'}
                      >
                        {booking.type === 'checkin' ? 'เช็คอิน' : 'เช็คเอาท์'}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/bookings/${booking.id}`}>ดู</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link to="/bookings/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">สร้างการจอง</h3>
                <p className="text-sm text-muted-foreground">
                  เพิ่มการจองใหม่
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link to="/rooms">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BedDouble className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">จัดการห้องพัก</h3>
                <p className="text-sm text-muted-foreground">
                  ดูสถานะห้องทั้งหมด
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link to="/access-codes">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">รหัสเข้าห้อง</h3>
                <p className="text-sm text-muted-foreground">
                  ดูรหัสเข้าห้องที่ใช้งาน
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
