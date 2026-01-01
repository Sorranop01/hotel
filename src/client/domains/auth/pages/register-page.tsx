import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/components/ui/card';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.displayName) {
      errors.displayName = 'กรุณากรอกชื่อ';
    }

    if (!formData.email) {
      errors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (formData.phoneNumber && !/^0[0-9]{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก';
    }

    if (!formData.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber || undefined,
      });
      navigate('/dashboard');
    } catch {
      // Error is handled in context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
          <CardDescription>
            สร้างบัญชี StayLock เพื่อจัดการที่พักของคุณ
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName" required>
                ชื่อ-นามสกุล
              </Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="ชื่อของคุณ"
                value={formData.displayName}
                onChange={handleChange}
                error={formErrors.displayName}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required>
                อีเมล
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                เบอร์โทรศัพท์
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="0812345678"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={formErrors.phoneNumber}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                ยืนยันรหัสผ่าน
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
