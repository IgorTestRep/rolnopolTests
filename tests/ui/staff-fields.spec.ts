import { test, expect } from '../../src/fixtures/fixtures';
import { TEST_USERS } from '../../src/data/users';

test.describe('Staff & Fields Management Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();
  });

  test('fields list loads and shows at least one field', async ({ staffFieldsPage }) => {
    await staffFieldsPage.goto();
    await staffFieldsPage.waitForFieldsLoaded();

    const count = await staffFieldsPage.fieldsList.locator('li').count();
    expect(count).toBeGreaterThan(0);
  });

  test('staff list is visible after page load', async ({ staffFieldsPage }) => {
    await staffFieldsPage.goto();
    await staffFieldsPage.waitForFieldsLoaded();

    await expect(staffFieldsPage.staffList).toBeVisible();
  });

  test('Add Field button opens the field modal', async ({ staffFieldsPage }) => {
    await staffFieldsPage.goto();
    await staffFieldsPage.waitForFieldsLoaded();

    await staffFieldsPage.addFieldButton.click();

    await expect(staffFieldsPage.addFieldModal).toBeVisible();
    await expect(staffFieldsPage.fieldNameInput).toBeVisible();
    await expect(staffFieldsPage.fieldAreaInput).toBeVisible();
  });

  test('Add Staff button opens the staff modal', async ({ staffFieldsPage, page }) => {
    await staffFieldsPage.goto();
    await staffFieldsPage.waitForFieldsLoaded();

    await staffFieldsPage.addStaffButton.click();

    await expect(staffFieldsPage.addStaffModal).toBeVisible();
    await expect(page.locator('#staffName')).toBeVisible();
    await expect(page.locator('#staffSurname')).toBeVisible();
    await expect(page.locator('#staffAge')).toBeVisible();
  });
});
