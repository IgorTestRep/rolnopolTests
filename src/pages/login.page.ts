import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for /login.html.
 * Selectors use data-testid attributes present in the application's HTML.
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly messageDiv: Locator;
  readonly registerLink: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit-btn');
    this.messageDiv = page.getByTestId('login-message');
    this.registerLink = page.getByTestId('register-link');
    this.homeLink = page.getByTestId('home-link');
  }

  async goto(): Promise<void> {
    await this.navigate('/login.html');
    await this.page.waitForSelector('[data-testid="login-form"]');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getMessageText(): Promise<string> {
    // On failed login the app shows a toast notification (role=alert).
    // Wait for either the toast or the fallback message div to contain text.
    await this.page
      .waitForFunction(
        () => {
          const toast = document.querySelector('[role="alert"]');
          if (toast && (toast.textContent ?? '').trim().length > 0) return true;
          const msg = document.querySelector('[data-testid="login-message"]');
          return msg !== null && (msg.textContent ?? '').trim().length > 0;
        },
        { timeout: 10_000 },
      )
      .catch(() => undefined);

    // Prefer the toast notification; fall back to the message div
    const toast = this.page.locator('[role="alert"]').first();
    if (await toast.isVisible().catch(() => false)) {
      return (await toast.textContent()) ?? '';
    }
    return (await this.messageDiv.textContent()) ?? '';
  }

  async waitForSuccessfulLogin(): Promise<void> {
    await this.page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 10_000,
    });
  }
}
