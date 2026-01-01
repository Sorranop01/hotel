import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  KeyRound,
  Search,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import {
  useAccessCodes,
  useRevokeAccessCode,
  useValidateAccessCode,
  useCleanupExpiredCodes,
} from '../hooks/use-access-codes';
import { useProperties } from '../../property/hooks/use-properties';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Select } from '../../../shared/components/ui/select';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Spinner } from '../../../shared/components/ui/spinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../shared/components/ui/modal';
import { formatDate, formatDateTime } from '../../../shared/lib/utils';

type CodeStatus = 'active' | 'used' | 'expired' | 'revoked';

function getCodeStatus(code: {
  isUsed: boolean;
  isRevoked: boolean;
  validFrom: Date | string;
  validUntil: Date | string;
}): CodeStatus {
  if (code.isRevoked) return 'revoked';
  if (code.isUsed) return 'used';

  const now = new Date();
  const validUntil = new Date(code.validUntil);

  if (now > validUntil) return 'expired';
  return 'active';
}

const STATUS_BADGES: Record<CodeStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  active: { label: 'ใช้งานได้', variant: 'success' },
  used: { label: 'ใช้แล้ว', variant: 'secondary' },
  expired: { label: 'หมดอายุ', variant: 'warning' },
  revoked: { label: 'ยกเลิก', variant: 'destructive' },
};

export function AccessCodeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const [includeExpired, setIncludeExpired] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: codes, isLoading: loadingCodes, refetch } = useAccessCodes({
    propertyId,
    includeExpired,
  });

  const revokeCode = useRevokeAccessCode();
  const validateCode = useValidateAccessCode();
  const cleanupCodes = useCleanupExpiredCodes();

  const [revokeModal, setRevokeModal] = useState<{ id: string; code: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [validateModal, setValidateModal] = useState(false);
  const [validateInput, setValidateInput] = useState('');
  const [validateResult, setValidateResult] = useState<{
    isValid: boolean;
    message: string;
    booking?: { guestName: string; roomName: string };
  } | null>(null);

  const handlePropertyChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('propertyId', value);
    setSearchParams(params);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRevoke = async () => {
    if (!revokeModal || !revokeReason.trim()) return;

    try {
      await revokeCode.mutateAsync({
        id: revokeModal.id,
        reason: revokeReason,
      });
      setRevokeModal(null);
      setRevokeReason('');
      refetch();
    } catch (error) {
      console.error('Failed to revoke:', error);
    }
  };

  const handleValidate = async () => {
    if (!validateInput.trim()) return;

    try {
      const result = await validateCode.mutateAsync({
        code: validateInput,
        propertyId: propertyId || undefined,
      });
      setValidateResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCleanup = async () => {
    if (!propertyId) return;

    try {
      const result = await cleanupCodes.mutateAsync(propertyId);
      alert(`ลบรหัสหมดอายุแล้ว ${result.cleanedCount} รายการ`);
      refetch();
    } catch (error) {
      console.error('Cleanup failed:', error);
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

  // Group codes by status for summary
  const activeCount = codes?.filter((c) => getCodeStatus(c) === 'active').length || 0;
  const usedCount = codes?.filter((c) => getCodeStatus(c) === 'used').length || 0;
  const expiredCount = codes?.filter((c) => getCodeStatus(c) === 'expired').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">รหัสเข้าห้อง</h1>
          <p className="text-muted-foreground">จัดการรหัสเข้าห้องพักทั้งหมด</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setValidateModal(true)}>
            <Search className="mr-2 h-4 w-4" />
            ตรวจสอบรหัส
          </Button>
          {propertyId && (
            <Button
              variant="outline"
              onClick={handleCleanup}
              disabled={cleanupCodes.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ล้างรหัสหมดอายุ
            </Button>
          )}
        </div>
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeExpired"
                checked={includeExpired}
                onChange={(e) => setIncludeExpired(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="includeExpired" className="text-sm">
                แสดงรหัสที่หมดอายุแล้ว
              </label>
            </div>

            <Button variant="outline" onClick={() => refetch()} disabled={loadingCodes}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingCodes ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {!propertyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <KeyRound className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">เลือกที่พัก</h3>
            <p className="mt-2 text-muted-foreground">
              กรุณาเลือกที่พักเพื่อดูรหัสเข้าห้อง
            </p>
          </CardContent>
        </Card>
      ) : loadingCodes ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !codes || codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <KeyRound className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">ไม่มีรหัสเข้าห้อง</h3>
            <p className="mt-2 text-muted-foreground">
              รหัสจะถูกสร้างอัตโนมัติเมื่อยืนยันการจอง
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ใช้งานได้</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-gray-100 p-3">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ใช้แล้ว</p>
                  <p className="text-2xl font-bold">{usedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-full bg-yellow-100 p-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">หมดอายุ</p>
                  <p className="text-2xl font-bold">{expiredCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                รายการรหัส ({codes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">รหัส</th>
                      <th className="pb-3 font-medium">การจอง</th>
                      <th className="pb-3 font-medium">ผู้เข้าพัก</th>
                      <th className="pb-3 font-medium">ใช้ได้ตั้งแต่</th>
                      <th className="pb-3 font-medium">หมดอายุ</th>
                      <th className="pb-3 font-medium">สถานะ</th>
                      <th className="pb-3 font-medium text-right">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {codes.map((code) => {
                      const status = getCodeStatus(code);
                      const statusConfig = STATUS_BADGES[status];

                      return (
                        <tr key={code.id} className="hover:bg-muted/50">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <code className="rounded bg-muted px-2 py-1 text-lg font-bold tracking-widest">
                                {code.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyCode(code.code)}
                              >
                                {copiedCode === code.code ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="font-medium text-primary">
                              {code.bookingNumber || '-'}
                            </span>
                          </td>
                          <td className="py-4">
                            {code.guestName || '-'}
                          </td>
                          <td className="py-4 text-sm">
                            {formatDate(code.validFrom)}
                          </td>
                          <td className="py-4 text-sm">
                            {formatDate(code.validUntil)}
                          </td>
                          <td className="py-4">
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                            {code.usedAt && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                ใช้เมื่อ {formatDateTime(code.usedAt)}
                              </p>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-1">
                              {status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setRevokeModal({ id: code.id, code: code.code })}
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
        </>
      )}

      {/* Revoke Modal */}
      <Modal open={!!revokeModal} onClose={() => setRevokeModal(null)}>
        <ModalHeader onClose={() => setRevokeModal(null)}>
          <ModalTitle>ยกเลิกรหัสเข้าห้อง</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <p>
            คุณต้องการยกเลิกรหัส <strong className="tracking-widest">{revokeModal?.code}</strong> ใช่หรือไม่?
          </p>
          <div className="space-y-2">
            <Label htmlFor="revokeReason" required>เหตุผลในการยกเลิก</Label>
            <Input
              id="revokeReason"
              placeholder="เช่น ผู้เข้าพักขอเปลี่ยนรหัส, สงสัยว่ารหัสรั่วไหล..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRevokeModal(null)} disabled={revokeCode.isPending}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeCode.isPending || !revokeReason.trim()}
          >
            {revokeCode.isPending ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Validate Modal */}
      <Modal open={validateModal} onClose={() => {
        setValidateModal(false);
        setValidateInput('');
        setValidateResult(null);
      }}>
        <ModalHeader onClose={() => setValidateModal(false)}>
          <ModalTitle>ตรวจสอบรหัสเข้าห้อง</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="validateCode">รหัส 6 หลัก</Label>
            <Input
              id="validateCode"
              placeholder="000000"
              value={validateInput}
              onChange={(e) => {
                setValidateInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                setValidateResult(null);
              }}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {validateResult && (
            <div className={`rounded-lg p-4 ${validateResult.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {validateResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">{validateResult.message}</span>
              </div>
              {validateResult.booking && (
                <div className="mt-2 text-sm">
                  <p>ผู้เข้าพัก: {validateResult.booking.guestName}</p>
                  <p>ห้อง: {validateResult.booking.roomName}</p>
                </div>
              )}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setValidateModal(false)}>
            ปิด
          </Button>
          <Button
            onClick={handleValidate}
            disabled={validateCode.isPending || validateInput.length !== 6}
          >
            {validateCode.isPending ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
