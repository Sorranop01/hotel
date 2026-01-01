import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRoom, useCreateRoom, useUpdateRoom, type RoomType } from '../hooks/use-rooms';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Select } from '../../../shared/components/ui/select';
import { Spinner } from '../../../shared/components/ui/spinner';

const ROOM_TYPE_OPTIONS = [
  { value: 'single', label: 'เตียงเดี่ยว' },
  { value: 'double', label: 'เตียงคู่' },
  { value: 'twin', label: 'เตียงแฝด' },
  { value: 'suite', label: 'ห้องสวีท' },
  { value: 'dormitory', label: 'ห้องรวม' },
];

const AMENITY_OPTIONS = [
  'แอร์',
  'พัดลม',
  'ทีวี',
  'ตู้เย็น',
  'WiFi',
  'ห้องน้ำส่วนตัว',
  'น้ำอุ่น',
  'เครื่องทำน้ำอุ่น',
  'ระเบียง',
  'วิวทะเล',
  'วิวภูเขา',
];

export function RoomFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: room, isLoading: loadingRoom } = useRoom(id || '');
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    type: 'double' as RoomType,
    floor: '',
    capacity: '2',
    pricePerNight: '',
    description: '',
    amenities: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        name: room.name || '',
        type: room.type,
        floor: room.floor?.toString() || '',
        capacity: room.capacity.toString(),
        pricePerNight: room.pricePerNight.toString(),
        description: room.description || '',
        amenities: room.amenities,
      });
    }
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as RoomType }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      errors.roomNumber = 'กรุณากรอกหมายเลขห้อง';
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      errors.capacity = 'กรุณากรอกจำนวนผู้เข้าพักที่ถูกต้อง';
    }

    if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0) {
      errors.pricePerNight = 'กรุณากรอกราคาที่ถูกต้อง';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const data = {
        propertyId: room?.propertyId || propertyId,
        roomNumber: formData.roomNumber,
        name: formData.name || undefined,
        type: formData.type,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        capacity: parseInt(formData.capacity),
        pricePerNight: parseFloat(formData.pricePerNight),
        description: formData.description || undefined,
        amenities: formData.amenities,
      };

      if (isEdit && id) {
        await updateRoom.mutateAsync({ id, data });
      } else {
        await createRoom.mutateAsync(data);
      }

      navigate(`/rooms?propertyId=${data.propertyId}`);
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const isPending = createRoom.isPending || updateRoom.isPending;

  if (isEdit && loadingRoom) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพักใหม่'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'แก้ไขข้อมูลห้องพัก' : 'กรอกข้อมูลเพื่อสร้างห้องพักใหม่'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>ข้อมูลห้องพัก</CardTitle>
            <CardDescription>
              กรอกข้อมูลพื้นฐานของห้องพัก
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomNumber" required>
                  หมายเลขห้อง
                </Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  placeholder="เช่น 101"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  error={formErrors.roomNumber}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  ชื่อห้อง (ถ้ามี)
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="เช่น Deluxe Sea View"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" required>
                  ประเภทห้อง
                </Label>
                <Select
                  options={ROOM_TYPE_OPTIONS}
                  value={formData.type}
                  onChange={handleTypeChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">
                  ชั้น
                </Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  placeholder="เช่น 1"
                  value={formData.floor}
                  onChange={handleChange}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity" required>
                  จำนวนผู้เข้าพักสูงสุด
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={formData.capacity}
                  onChange={handleChange}
                  error={formErrors.capacity}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerNight" required>
                  ราคาต่อคืน (บาท)
                </Label>
                <Input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  error={formErrors.pricePerNight}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                รายละเอียด
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="รายละเอียดเกี่ยวกับห้องพัก"
                value={formData.description}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>สิ่งอำนวยความสะดวก</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:bg-muted'
                    }`}
                    disabled={isPending}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'สร้างห้อง'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
