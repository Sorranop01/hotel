import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  KeyRound,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  BedDouble,
  Calendar,
  User,
  Loader2,
  Home,
} from 'lucide-react';
import { api } from '../shared/lib/api';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/components/ui/card';
import { Badge } from '../shared/components/ui/badge';

interface ValidateResult {
  isValid: boolean;
  message: string;
  booking?: {
    id: string;
    bookingNumber: string;
    guestName: string;
    roomName: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    propertyName: string;
    status: string;
  };
}

interface UseCodeResult {
  success: boolean;
  message: string;
  accessGranted: boolean;
}

export function CheckinPage() {
  const { code: urlCode } = useParams<{ code: string }>();
  const [code, setCode] = useState(urlCode || '');
  const [step, setStep] = useState<'input' | 'validating' | 'valid' | 'invalid' | 'success'>('input');
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
  const [, setUseCodeResult] = useState<UseCodeResult | null>(null);

  // Validate code mutation
  const validateCode = useMutation({
    mutationFn: async (accessCode: string) => {
      const response = await api.post('/access-codes/validate', { code: accessCode });
      return response as unknown as ValidateResult;
    },
    onSuccess: (result) => {
      setValidateResult(result);
      setStep(result.isValid ? 'valid' : 'invalid');
    },
    onError: () => {
      setStep('invalid');
      setValidateResult({
        isValid: false,
        message: 'ไม่สามารถตรวจสอบรหัสได้ กรุณาลองใหม่อีกครั้ง',
      });
    },
  });

  // Use code mutation (unlock door)
  const useCode = useMutation({
    mutationFn: async (accessCode: string) => {
      const response = await api.post(`/access-codes/use/${accessCode}`);
      return response as unknown as UseCodeResult;
    },
    onSuccess: (result) => {
      setUseCodeResult(result);
      if (result.success) {
        setStep('success');
      }
    },
  });

  // Auto-validate if code is in URL
  useEffect(() => {
    if (urlCode && urlCode.length === 6) {
      setCode(urlCode);
      setStep('validating');
      validateCode.mutate(urlCode);
    }
  }, [urlCode]);

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);

    // Reset state when code changes
    if (step !== 'input') {
      setStep('input');
      setValidateResult(null);
    }
  };

  const handleValidate = () => {
    if (code.length === 6) {
      setStep('validating');
      validateCode.mutate(code);
    }
  };

  const handleUseCode = () => {
    if (code.length === 6) {
      useCode.mutate(code);
    }
  };

  const handleReset = () => {
    setCode('');
    setStep('input');
    setValidateResult(null);
    setUseCodeResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">StayLock</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                หน้าแรก
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {/* Input Step */}
          {step === 'input' && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">เช็คอิน</CardTitle>
                <CardDescription>
                  กรอกรหัส 6 หลักที่ได้รับจากการจอง
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="text-center text-3xl tracking-[0.5em] font-mono h-16"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    รหัสมี 6 หลัก
                  </p>
                </div>
                <Button
                  className="w-full h-12"
                  onClick={handleValidate}
                  disabled={code.length !== 6}
                >
                  ตรวจสอบรหัส
                </Button>
              </CardContent>
            </>
          )}

          {/* Validating Step */}
          {step === 'validating' && (
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">กำลังตรวจสอบรหัส...</p>
              <p className="text-muted-foreground mt-2">กรุณารอสักครู่</p>
            </CardContent>
          )}

          {/* Valid Code Step */}
          {step === 'valid' && validateResult?.booking && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">รหัสถูกต้อง!</CardTitle>
                <CardDescription>
                  พร้อมเข้าห้องพักแล้ว
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ที่พัก</p>
                      <p className="font-medium">{validateResult.booking.propertyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ห้องพัก</p>
                      <p className="font-medium">
                        {validateResult.booking.roomName} (ห้อง {validateResult.booking.roomNumber})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ผู้เข้าพัก</p>
                      <p className="font-medium">{validateResult.booking.guestName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ช่วงเข้าพัก</p>
                      <p className="font-medium">
                        {format(new Date(validateResult.booking.checkIn), 'd MMM', { locale: th })} - {' '}
                        {format(new Date(validateResult.booking.checkOut), 'd MMM yyyy', { locale: th })}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      เลขที่จอง: {validateResult.booking.bookingNumber}
                    </Badge>
                  </div>
                </div>

                <Button
                  className="w-full h-12"
                  onClick={handleUseCode}
                  disabled={useCode.isPending}
                >
                  {useCode.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังปลดล็อค...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      ปลดล็อคประตู
                    </>
                  )}
                </Button>

                {useCode.error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                    เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={handleReset}>
                  ใช้รหัสอื่น
                </Button>
              </CardContent>
            </>
          )}

          {/* Invalid Code Step */}
          {step === 'invalid' && (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-600">รหัสไม่ถูกต้อง</CardTitle>
                <CardDescription>
                  {validateResult?.message || 'ไม่พบรหัสนี้ในระบบ หรือรหัสหมดอายุแล้ว'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">ตรวจสอบให้แน่ใจว่า:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>กรอกรหัสถูกต้องครบ 6 หลัก</li>
                        <li>ยังอยู่ในช่วงเวลาเข้าพัก</li>
                        <li>รหัสยังไม่ถูกยกเลิก</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={handleReset}>
                  ลองใหม่อีกครั้ง
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  หากยังมีปัญหา กรุณาติดต่อที่พักของคุณ
                </p>
              </CardContent>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">ปลดล็อคสำเร็จ!</CardTitle>
                <CardDescription>
                  ประตูถูกปลดล็อคแล้ว กรุณาเข้าห้องพัก
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {validateResult?.booking && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-800">
                      ห้อง <span className="font-bold">{validateResult.booking.roomNumber}</span>
                    </p>
                    <p className="text-2xl font-bold text-green-700 mt-2">
                      {validateResult.booking.roomName}
                    </p>
                  </div>
                )}

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>ยินดีต้อนรับสู่ที่พักของเรา</p>
                  <p>หากต้องการความช่วยเหลือ กรุณาติดต่อเจ้าของที่พัก</p>
                </div>

                <Button variant="outline" className="w-full" onClick={handleReset}>
                  เช็คอินรหัสอื่น
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Powered by StayLock</p>
      </footer>
    </div>
  );
}
