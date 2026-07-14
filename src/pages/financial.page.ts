import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for /financial.html */
export class FinancialPage extends BasePage {
  readonly balanceAmount: Locator;
  readonly totalIncome: Locator;
  readonly totalExpenses: Locator;
  readonly transactionCount: Locator;
  readonly transactionsContainer: Locator;
  readonly transferFormHeader: Locator;
  readonly transferToUserIdInput: Locator;
  readonly transferAmountInput: Locator;
  readonly transferDescriptionInput: Locator;
  readonly submitTransferButton: Locator;

  constructor(page: Page) {
    super(page);
    this.balanceAmount          = page.locator('#current-balance');
    this.totalIncome            = page.locator('#total-income');
    this.totalExpenses          = page.locator('#total-expenses');
    this.transactionCount       = page.locator('#transaction-count');
    this.transactionsContainer  = page.locator('#transactions-container');
    this.transferFormHeader     = page.locator('#transfer-form-header');
    this.transferToUserIdInput  = page.locator('#transfer-toUserId');
    this.transferAmountInput    = page.locator('#transfer-amount');
    this.transferDescriptionInput = page.locator('#transfer-description');
    this.submitTransferButton   = page.locator('#submit-transfer');
  }

  async goto(): Promise<void> {
    await this.navigate('/financial.html');
    await this.page.waitForSelector('#current-balance');
  }

  async waitForBalanceLoaded(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const el = document.getElementById('current-balance');
        return el !== null && el.textContent !== '0.00 ROL' && el.textContent?.trim() !== '';
      },
      { timeout: 10_000 },
    );
  }

  async openTransferForm(): Promise<void> {
    await this.transferFormHeader.click();
    await this.page.locator('#transfer-form-content').waitFor({ state: 'visible' });
  }
}
