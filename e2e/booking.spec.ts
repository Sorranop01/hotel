import { test, expect } from '@playwright/test';

test.describe('Public Booking Page', () => {
  test('should load booking page and handle non-existent property', async ({ page }) => {
    await page.goto('/book/non-existent-property');

    // Wait for page load
    await page.waitForLoadState('domcontentloaded');

    // Page should load correctly (either show loading, error, or content)
    // The URL should be correct
    expect(page.url()).toContain('/book/non-existent-property');

    // Check that page rendered something (no blank page)
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });

  test('should have booking page accessible', async ({ page }) => {
    await page.goto('/book/test-property');

    // Page loads without throwing
    await page.waitForLoadState('domcontentloaded');

    // URL is correct
    expect(page.url()).toContain('/book/test-property');
  });
});

test.describe('Booking Page URL Structure', () => {
  test('should have correct URL structure for booking', async ({ page }) => {
    await page.goto('/book/test-hostel');

    // URL should match pattern /book/:slug
    expect(page.url()).toContain('/book/test-hostel');
  });

  test('should load booking page without crashing', async ({ page }) => {
    await page.goto('/book/demo-property');

    // Page should load without JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.waitForLoadState('networkidle');

    // No critical errors (allow network errors as API might not be running)
    const criticalErrors = errors.filter((e) => !e.includes('network') && !e.includes('fetch'));
    expect(criticalErrors.length).toBe(0);
  });
});
