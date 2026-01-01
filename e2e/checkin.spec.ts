import { test, expect } from '@playwright/test';

test.describe('Check-in Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkin');
  });

  test('should display check-in form', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: 'เช็คอิน' })).toBeVisible();

    // Check code input
    const codeInput = page.getByPlaceholder('000000');
    await expect(codeInput).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: 'ตรวจสอบรหัส' })).toBeVisible();
  });

  test('should display StayLock branding', async ({ page }) => {
    await expect(page.getByText('StayLock').first()).toBeVisible();
  });

  test('should have home navigation link', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: 'หน้าแรก' });
    await expect(homeLink).toBeVisible();
  });

  test('should only accept numeric input', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    // Try typing letters - should be filtered out
    await codeInput.fill('abc123');
    await expect(codeInput).toHaveValue('123');

    // Clear and type numbers
    await codeInput.fill('');
    await codeInput.fill('654321');
    await expect(codeInput).toHaveValue('654321');
  });

  test('should limit input to 6 digits', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    await codeInput.fill('12345678');
    await expect(codeInput).toHaveValue('123456');
  });

  test('should disable submit button for incomplete code', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');
    const submitButton = page.getByRole('button', { name: 'ตรวจสอบรหัส' });

    // Empty input - button should be disabled
    await expect(submitButton).toBeDisabled();

    // Partial code - button should be disabled
    await codeInput.fill('123');
    await expect(submitButton).toBeDisabled();

    // Complete code - button should be enabled
    await codeInput.fill('123456');
    await expect(submitButton).toBeEnabled();
  });

  test('should show invalid code error for wrong code', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    await codeInput.fill('000000');
    await page.getByRole('button', { name: 'ตรวจสอบรหัส' }).click();

    // Wait for API response and check for error message
    await expect(page.getByText('รหัสไม่ถูกต้อง')).toBeVisible({ timeout: 10000 });
  });

  test('should display helpful hints on invalid code', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    await codeInput.fill('999999');
    await page.getByRole('button', { name: 'ตรวจสอบรหัส' }).click();

    // Wait for error state and check hints
    await expect(page.getByText('กรอกรหัสถูกต้องครบ 6 หลัก')).toBeVisible({ timeout: 10000 });
  });

  test('should have retry button after invalid code', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    await codeInput.fill('111111');
    await page.getByRole('button', { name: 'ตรวจสอบรหัส' }).click();

    // Wait for error and check retry button
    await expect(page.getByRole('button', { name: 'ลองใหม่อีกครั้ง' })).toBeVisible({ timeout: 10000 });
  });

  test('should reset form when clicking retry', async ({ page }) => {
    const codeInput = page.getByPlaceholder('000000');

    await codeInput.fill('222222');
    await page.getByRole('button', { name: 'ตรวจสอบรหัส' }).click();

    // Wait for error and click retry
    await page.getByRole('button', { name: 'ลองใหม่อีกครั้ง' }).click({ timeout: 10000 });

    // Should reset to input state
    await expect(page.getByPlaceholder('000000')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'เช็คอิน' })).toBeVisible();
  });

  test('should navigate home when clicking home link', async ({ page }) => {
    await page.getByRole('link', { name: 'หน้าแรก' }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Check-in Page with Code in URL', () => {
  test('should auto-fill code from URL parameter', async ({ page }) => {
    await page.goto('/checkin/123456');

    // Should show validating state or result
    // The code input might not be visible if auto-validating
    await expect(page.getByText(/กำลังตรวจสอบ|รหัสไม่ถูกต้อง/)).toBeVisible({ timeout: 10000 });
  });

  test('should validate code automatically when provided in URL', async ({ page }) => {
    await page.goto('/checkin/000000');

    // Should show validation result (likely invalid for test code)
    await expect(page.getByText('รหัสไม่ถูกต้อง')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Check-in Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkin');
  });

  test('should have proper heading structure', async ({ page }) => {
    const headings = page.getByRole('heading');
    await expect(headings.first()).toBeVisible();
  });

  test('should have labeled form inputs', async ({ page }) => {
    // Input should have associated label or placeholder
    const codeInput = page.getByPlaceholder('000000');
    await expect(codeInput).toBeVisible();
    await expect(codeInput).toHaveAttribute('type', 'text');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to input
    await page.keyboard.press('Tab');

    // Input should be focused (or first focusable element)
    const codeInput = page.getByPlaceholder('000000');
    await codeInput.focus();
    await expect(codeInput).toBeFocused();

    // Type code
    await codeInput.fill('123456');

    // Tab to button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'ตรวจสอบรหัส' })).toBeFocused();
  });
});
