import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, BedDouble, Users, Banknote, MoreVertical } from 'lucide-react';
import { useRooms, useRoomStats, useUpdateRoomStatus, useDeleteRoom, type RoomStatus } from '../hooks/use-rooms';
import { useProperties } from '../../property/hooks/use-properties';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Select } from '../../../shared/components/ui/select';
import { Spinner } from '../../../shared/components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../shared/components/ui/modal';
import { formatCurrency } from '../../../shared/lib/utils';

const STATUS_OPTIONS = [
  { value: 'available', label: 'ว่าง' },
  { value: 'occupied', label: 'มีผู้เข้าพัก' },
  { value: 'cleaning', label: 'กำลังทำความสะอาด' },
  { value: 'maintenance', label: 'ซ่อมบำรุง' },
];

const STATUS_BADGES: Record<RoomStatus, { label: string; variant: 'success' | 'default' | 'warning' | 'destructive' }> = {
  available: { label: 'ว่าง', variant: 'success' },
  occupied: { label: 'มีผู้เข้าพัก', variant: 'default' },
  cleaning: { label: 'ทำความสะอาด', variant: 'warning' },
  maintenance: { label: 'ซ่อมบำรุง', variant: 'destructive' },
};

const TYPE_LABELS: Record<string, string> = {
  single: 'เตียงเดี่ยว',
  double: 'เตียงคู่',
  twin: 'เตียงแฝด',
  suite: 'ห้องสวีท',
  dormitory: 'ห้องรวม',
};

export function RoomListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';

  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const { data: stats } = useRoomStats(propertyId);
  const updateStatus = useUpdateRoomStatus();
  const deleteRoom = useDeleteRoom();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; propertyId: string } | null>(null);

  const handlePropertyChange = (value: string) => {
    setSearchParams({ propertyId: value });
  };

  const handleStatusChange = async (roomId: string, status: RoomStatus) => {
    await updateStatus.mutateAsync({ id: roomId, status });
  };

  const handleConfirmDelete = async () => {
    if (roomToDelete) {
      await deleteRoom.mutateAsync(roomToDelete);
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

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
          <h1 className="text-2xl font-bold">ห้องพัก</h1>
          <p className="text-muted-foreground">จัดการห้องพักทั้งหมด</p>
        </div>
        {propertyId && (
          <Button asChild>
            <Link to={`/rooms/new?propertyId=${propertyId}`}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มห้อง
            </Link>
          </Button>
        )}
      </div>

      {/* Property Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <Select
              options={propertyOptions}
              value={propertyId}
              onChange={handlePropertyChange}
              placeholder="เลือกที่พัก"
            />
          </div>
        </CardContent>
      </Card>

      {!propertyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BedDouble className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">เลือกที่พัก</h3>
            <p className="mt-2 text-muted-foreground">
              กรุณาเลือกที่พักเพื่อดูห้องพัก
            </p>
          </CardContent>
        </Card>
      ) : loadingRooms ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                  <p className="text-sm text-muted-foreground">ว่าง</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
                  <p className="text-sm text-muted-foreground">มีผู้เข้าพัก</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{stats.cleaning}</div>
                  <p className="text-sm text-muted-foreground">ทำความสะอาด</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{stats.maintenance}</div>
                  <p className="text-sm text-muted-foreground">ซ่อมบำรุง</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Room Grid */}
          {rooms?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BedDouble className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">ยังไม่มีห้องพัก</h3>
                <p className="mt-2 text-muted-foreground">
                  เริ่มต้นด้วยการเพิ่มห้องพักแรก
                </p>
                <Button className="mt-4" asChild>
                  <Link to={`/rooms/new?propertyId=${propertyId}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มห้อง
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rooms?.map((room) => {
                const statusConfig = STATUS_BADGES[room.status];
                return (
                  <Card key={room.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            ห้อง {room.roomNumber}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {TYPE_LABELS[room.type] || room.type}
                            {room.floor && ` • ชั้น ${room.floor}`}
                          </p>
                        </div>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{room.capacity} คน</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <Banknote className="h-4 w-4" />
                          <span>{formatCurrency(room.pricePerNight)}/คืน</span>
                        </div>
                      </div>

                      {room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Select
                          options={STATUS_OPTIONS}
                          value={room.status}
                          onChange={(value) => handleStatusChange(room.id, value as RoomStatus)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <Link to={`/rooms/${room.id}/edit?propertyId=${propertyId}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader onClose={() => setDeleteModalOpen(false)}>
          <ModalTitle>ยืนยันการลบ</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>คุณแน่ใจหรือไม่ที่จะลบห้องนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteRoom.isPending}
          >
            {deleteRoom.isPending ? 'กำลังลบ...' : 'ลบ'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
