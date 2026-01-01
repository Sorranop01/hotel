import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display StayLock branding', async ({ page }) => {
    // Check header logo
    await expect(page.locator('header').getByText('StayLock')).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/StayLock/);
  });

  test('should display hero section with tagline', async ({ page }) => {
    // Check hero heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ระบบจัดการที่พัก');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Front Desk');
  });

  test('should have working navigation links', async ({ page }) => {
    // Check login button in header
    const loginLink = page.locator('header').getByRole('link', { name: 'เข้าสู่ระบบ' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');

    // Check register button in header
    const registerLink = page.locator('header').getByRole('link', { name: 'สมัครใช้งาน' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('should display feature cards', async ({ page }) => {
    // Check features section exists
    const featuresHeading = page.getByRole('heading', { name: 'ฟีเจอร์ที่ครบครัน' });
    await expect(featuresHeading).toBeVisible();

    // Check some feature cards are visible
    await expect(page.getByText('รหัสเข้าห้องอัตโนมัติ')).toBeVisible();
    await expect(page.getByText('จองออนไลน์ 24 ชม.')).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    // Check benefits heading
    await expect(page.getByRole('heading', { name: 'เหมาะสำหรับที่พักขนาดเล็ก' })).toBeVisible();

    // Check some benefits are listed
    await expect(page.getByText('ลดค่าใช้จ่ายพนักงานต้อนรับ')).toBeVisible();
    await expect(page.getByText('ผู้เข้าพักเช็คอินได้ตลอด 24 ชม.')).toBeVisible();
  });

  test('should display CTA section', async ({ page }) => {
    // Check CTA heading
    await expect(page.getByRole('heading', { name: /พร้อมเปลี่ยนที่พักของคุณ/ })).toBeVisible();

    // Check CTA button
    const ctaButton = page.getByRole('link', { name: 'สมัครใช้งานฟรี' }).last();
    await expect(ctaButton).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    // Check footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer').getByText('StayLock').first()).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.locator('header').getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.locator('header').getByRole('link', { name: 'สมัครใช้งาน' }).click();
    await expect(page).toHaveURL('/register');
  });
});
