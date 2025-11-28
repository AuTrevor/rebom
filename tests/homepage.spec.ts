import { test, expect } from '@playwright/test';

test('homepage has title and weather data', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AusWeather Core/);

  // Check header
  await expect(page.locator('header')).toBeVisible();

  // Check 7-Day Outlook component
  await expect(page.getByText('7-Day Outlook')).toBeVisible();

  // Check for some weather data (rendered from mock)
  // We can expect "Today" to be present
  await expect(page.getByText('Today')).toBeVisible();
});

test('interactive outlook', async ({ page }) => {
    await page.goto('/');

    // Wait for hydration/rendering to complete
    await expect(page.getByText('7-Day Outlook')).toBeVisible();

    // Find the first day button. Use a more robust selector if needed.
    const firstDayButton = page.locator('button[aria-controls="details-0"]');

    // Ensure it exists and is visible before clicking
    await expect(firstDayButton).toBeVisible();
    await firstDayButton.click();

    // Check if details are revealed.
    const details = page.locator('#details-0');

    // Increase timeout or verify existence first
    await expect(details).toBeVisible({ timeout: 10000 });
});
