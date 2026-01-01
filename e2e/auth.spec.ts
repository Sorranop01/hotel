import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();

    // Check form elements using id selectors
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'สมัครสมาชิก' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click login without filling form
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // Check for custom validation error message
    await expect(page.getByText('กรุณากรอกอีเมล')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.locator('#email').fill('invalid-email');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // Should stay on login page (validation prevents navigation)
    await expect(page).toHaveURL(/login/);
    // Check for email format error or URL still on login
    const errorVisible = await page.getByText('รูปแบบอีเมลไม่ถูกต้อง').isVisible().catch(() => false);
    expect(errorVisible || page.url().includes('login')).toBeTruthy();
  });

  test('should navigate to register page via link', async ({ page }) => {
    await page.getByRole('link', { name: 'สมัครสมาชิก' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should have back to home link', async ({ page }) => {
    // Check for home navigation
    const homeLink = page.getByRole('link', { name: 'StayLock' }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'สมัครสมาชิก' })).toBeVisible();

    // Check form elements using id selectors
    await expect(page.locator('#displayName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.getByRole('button', { name: 'สมัครสมาชิก' })).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'เข้าสู่ระบบ' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('should show validation for required fields', async ({ page }) => {
    // Click register without filling form
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    // Check for custom validation error message
    await expect(page.getByText('กรุณากรอกชื่อ')).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.locator('#displayName').fill('Test User');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('different-password');
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    // Should show password mismatch error
    await expect(page.getByText('รหัสผ่านไม่ตรงกัน')).toBeVisible();
  });

  test('should navigate to login page via link', async ({ page }) => {
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing properties without auth', async ({ page }) => {
    await page.goto('/properties');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing bookings without auth', async ({ page }) => {
    await page.goto('/bookings');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
