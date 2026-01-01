import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MapPin, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../hooks/use-properties';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Spinner } from '../../../shared/components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../shared/components/ui/modal';

export function PropertyListPage() {
  const { data: properties, isLoading, error } = useProperties();
  const deleteProperty = useDeleteProperty();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (propertyToDelete) {
      await deleteProperty.mutateAsync(propertyToDelete);
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        เกิดข้อผิดพลาดในการโหลดข้อมูล
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ที่พักของฉัน</h1>
          <p className="text-muted-foreground">จัดการที่พักทั้งหมดของคุณ</p>
        </div>
        <Button asChild>
          <Link to="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มที่พัก
          </Link>
        </Button>
      </div>

      {properties?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">ยังไม่มีที่พัก</h3>
            <p className="mt-2 text-muted-foreground">
              เริ่มต้นด้วยการเพิ่มที่พักแรกของคุณ
            </p>
            <Button className="mt-4" asChild>
              <Link to="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มที่พัก
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription className="text-xs">
                        /{property.slug}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/properties/${property.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(property.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{property.address}</span>
                </div>
                {property.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{property.phone}</span>
                  </div>
                )}
                {property.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{property.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary">
                    {property.roomCount} ห้อง
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/properties/${property.id}`}>
                      ดูรายละเอียด
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader onClose={() => setDeleteModalOpen(false)}>
          <ModalTitle>ยืนยันการลบ</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>คุณแน่ใจหรือไม่ที่จะลบที่พักนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteProperty.isPending}
          >
            {deleteProperty.isPending ? 'กำลังลบ...' : 'ลบ'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
