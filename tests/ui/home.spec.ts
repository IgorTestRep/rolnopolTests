import { test, expect } from '../../src/fixtures/fixtures';
import { TEST_USERS } from '../../src/data/users';

/**
 * Suite: Farm Navigation & Platform Features UI
 *
 * Business scenarios:
 *  - home page exposes key farm metrics to visitors (public statistics)
 *  - authenticated users can reach core business areas: financial, marketplace, field map
 *  - statistics data contract: values are non-negative numbers
 *  - home page correctly renders API data received from the statistics endpoint
 */
test.describe('Farm Navigation & Platform Features UI', () => {
  test('home page renders all 5 farm statistic blocks', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.statUsers).toBeVisible();
    await expect(homePage.statFarms).toBeVisible();
    await expect(homePage.statArea).toBeVisible();
    await expect(homePage.statStaff).toBeVisible();
    await expect(homePage.statAnimals).toBeVisible();
  });

  test('home page title identifies the platform', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title).toContain('Rolnopol');
  });

  test('authenticated user can reach the financial management page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();

    await page.goto('/financial.html');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(/login\.html/);
    const title = await page.title();
    expect(title.toLowerCase()).not.toContain('404');
  });

  test('authenticated user can reach the marketplace page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();

    await page.goto('/marketplace.html');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(/login\.html/);
    const title = await page.title();
    expect(title.toLowerCase()).not.toContain('404');
  });

  test('mocked farm statistics are displayed on the home page', async ({ page }) => {
    await page.route('**/api/v1/statistics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 99, farms: 12, area: 500, staff: 45, animals: 300 }),
      }),
    );

    const statsReady = page.waitForResponse((r) => r.url().includes('/api/v1/statistics'));
    await page.goto('/');
    await statsReady;
    await page.waitForTimeout(1600);

    // The DOM should contain animated numeric values, not the loading placeholder
    for (const id of ['#stat-users', '#stat-farms', '#stat-staff', '#stat-animals']) {
      const text = await page.locator(id).innerText();
      expect(text).not.toBe('-');
      expect(text).toMatch(/\d/);
    }
  });
});

