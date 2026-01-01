import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProperty, useCreateProperty, useUpdateProperty } from '../hooks/use-properties';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Spinner } from '../../../shared/components/ui/spinner';

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: property, isLoading: loadingProperty } = useProperty(id || '');
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        description: property.description || '',
        address: property.address,
        phone: property.phone || '',
        email: property.email || '',
      });
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'กรุณากรอกชื่อที่พัก';
    }

    if (!formData.address.trim()) {
      errors.address = 'กรุณากรอกที่อยู่';
    }

    if (formData.phone && !/^0[0-9]{8,9}$/.test(formData.phone)) {
      errors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      };

      if (isEdit && id) {
        await updateProperty.mutateAsync({ id, data });
      } else {
        await createProperty.mutateAsync(data);
      }

      navigate('/properties');
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  const isPending = createProperty.isPending || updateProperty.isPending;

  if (isEdit && loadingProperty) {
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
            {isEdit ? 'แก้ไขที่พัก' : 'เพิ่มที่พักใหม่'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'แก้ไขข้อมูลที่พักของคุณ' : 'กรอกข้อมูลเพื่อสร้างที่พักใหม่'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>ข้อมูลที่พัก</CardTitle>
            <CardDescription>
              กรอกข้อมูลพื้นฐานของที่พัก
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                ชื่อที่พัก
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="เช่น บ้านพักริมน้ำ"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                disabled={isPending}
              />
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
                placeholder="รายละเอียดเกี่ยวกับที่พัก"
                value={formData.description}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" required>
                ที่อยู่
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="ที่อยู่ของที่พัก"
                value={formData.address}
                onChange={handleChange}
                error={formErrors.address}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0812345678"
                  value={formData.phone}
                  onChange={handleChange}
                  error={formErrors.phone}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  disabled={isPending}
                />
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
              {isPending ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'สร้างที่พัก'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
