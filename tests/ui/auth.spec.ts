import { test, expect } from '../../src/fixtures/fixtures';
import { TEST_USERS, INVALID_CREDENTIALS } from '../../src/data/users';

test.describe('User Authentication Journey', () => {
  test('successful login redirects to the profile page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);

    await loginPage.waitForSuccessfulLogin();

    await expect(page).toHaveURL(/profile\.html/);
  });

  test('after login, profile page displays the user display name', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();

    // The profile page renders the display name as an h2 heading
    await expect(page.locator('h2').filter({ hasText: 'Demo User' })).toBeVisible({ timeout: 10_000 });
  });

  test('after login, user can access the financial management page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();

    await page.goto('/financial.html');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(/login\.html/);
    await expect(page.locator('#current-balance')).toBeVisible();
  });

  test('after login, user can access the staff and fields management page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();

    await page.goto('/staff-fields-main.html');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(/login\.html/);
    await expect(page.locator('#fieldsList')).toBeVisible();
  });

  test('wrong password keeps the user on login page with an error', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(INVALID_CREDENTIALS.wrongPassword.email, INVALID_CREDENTIALS.wrongPassword.password);

    const message = await loginPage.getMessageText();
    expect(message.trim().length).toBeGreaterThan(0);
    await expect(page).toHaveURL(/login\.html/);
  });

  test('logout via API invalidates the session token', async ({ authApi }) => {
    const loginRes = await authApi.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    const token = loginRes.body.data.token;
    expect(token).toBeTruthy();

    const logoutRes = await authApi.logout(token);
    expect([200, 204]).toContain(logoutRes.status);

    // Revoked token must no longer grant access to a protected endpoint
    const profileRes = await authApi.getProfile(token);
    expect([401, 403]).toContain(profileRes.status);
  });
});

