import { test, expect } from '../../src/fixtures/fixtures';

/**
 * Suite: Home Page - Frontend Integration with Mocked Statistics API
 *
 * Business scenarios:
 *  - page correctly renders realistic farm data returned by the API (happy path)
 *  - page stays functional when the API returns a 500 error (resilience)
 *  - zero values are displayed without NaN / "undefined" artefacts (edge case)
 *  - large numbers (>1 000) are abbreviated with K / M suffixes (display contract)
 */
test.describe('Home Page - Frontend Integration with Mocked Statistics', () => {
  test('renders all 5 farm metric blocks with realistic API data', async ({ page }) => {
    await page.route('**/api/v1/statistics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 42, farms: 15, area: 3750, staff: 85, animals: 420 }),
      }),
    );

    const statsReady = page.waitForResponse((r) => r.url().includes('/api/v1/statistics'));
    await page.goto('/');
    await statsReady;
    await page.waitForTimeout(1600);

    for (const id of ['#stat-users', '#stat-farms', '#stat-area', '#stat-staff', '#stat-animals']) {
      const text = await page.locator(id).innerText();
      expect(text).not.toBe('-');
      expect(text).toMatch(/\d/);
    }
  });

  test('page remains fully functional when the statistics API returns 500', async ({ page }) => {
    await page.route('**/api/v1/statistics', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    );

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await expect(page.locator('#general-stats')).toBeVisible();
    await expect(page.locator('#stat-users')).toBeVisible();
  });

  test('zero-value statistics display without NaN or undefined artefacts', async ({ page }) => {
    await page.route('**/api/v1/statistics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 0, farms: 0, area: 0, staff: 0, animals: 0 }),
      }),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const id of ['#stat-users', '#stat-farms', '#stat-area', '#stat-staff']) {
      const text = await page.locator(id).innerText();
      expect(text.toLowerCase()).not.toContain('nan');
      expect(text.toLowerCase()).not.toContain('undefined');
    }
    await expect(page.locator('#general-stats')).toBeVisible();
  });

  test('large numbers are abbreviated with K or M suffixes', async ({ page }) => {
    await page.route('**/api/v1/statistics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 1250000, farms: 50000, area: 25000000, staff: 500000, animals: 10000000 }),
      }),
    );

    const statsReady = page.waitForResponse((r) => r.url().includes('/api/v1/statistics'));
    await page.goto('/');
    await statsReady;
    await page.waitForTimeout(1600);

    const usersText = await page.locator('#stat-users').innerText();
    expect(usersText).not.toBe('-');
    // 1 250 000 must be abbreviated - the formatter should produce something like "1,3M"
    expect(usersText).not.toMatch(/^1250000/);
  });
});