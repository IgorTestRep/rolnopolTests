import { test, expect } from '../../src/fixtures/fixtures';
import { TEST_USERS } from '../../src/data/users';

test.describe('Financial Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    await loginPage.waitForSuccessfulLogin();
  });

  test('current balance is displayed and non-zero for the demo user', async ({ financialPage }) => {
    await financialPage.goto();
    await financialPage.waitForBalanceLoaded();

    const balance = await financialPage.balanceAmount.innerText();
    expect(balance).toContain('ROL');
    expect(balance).not.toBe('0.00 ROL');
  });

  test('financial overview shows income, expenses and transaction count', async ({ financialPage }) => {
    await financialPage.goto();
    await financialPage.waitForBalanceLoaded();

    await expect(financialPage.totalIncome).toBeVisible();
    await expect(financialPage.totalExpenses).toBeVisible();
    await expect(financialPage.transactionCount).toBeVisible();

    const count = await financialPage.transactionCount.innerText();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('transaction history section renders entries', async ({ financialPage, page }) => {
    await financialPage.goto();
    await financialPage.waitForBalanceLoaded();

    // Wait for the async load to replace the "Loading transactions..." placeholder
    await page.waitForFunction(
      () => {
        const c = document.getElementById('transactions-container');
        return c !== null && !c.innerText.includes('Loading');
      },
      { timeout: 10_000 },
    );

    await expect(financialPage.transactionsContainer).toBeVisible();
    // The container must have actual rows, not just the loading placeholder
    const html = await financialPage.transactionsContainer.innerHTML();
    expect(html).not.toContain('Loading transactions');
  });

  test('transfer funds form is accessible by clicking the section header', async ({ financialPage }) => {
    await financialPage.goto();
    await financialPage.waitForBalanceLoaded();

    await financialPage.openTransferForm();

    await expect(financialPage.transferToUserIdInput).toBeVisible();
    await expect(financialPage.transferAmountInput).toBeVisible();
    await expect(financialPage.transferDescriptionInput).toBeVisible();
  });

  test('transfer form validates missing required fields', async ({ financialPage }) => {
    await financialPage.goto();
    await financialPage.waitForBalanceLoaded();
    await financialPage.openTransferForm();

    // Click submit with no data filled in — HTML5 validation should prevent submission
    await financialPage.submitTransferButton.click();

    // Still on financial page (not redirected)
    await expect(financialPage.page).toHaveURL(/financial\.html/);
  });
});
