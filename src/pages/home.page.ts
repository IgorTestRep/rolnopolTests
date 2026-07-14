import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the home page (/index.html).
 * Covers statistics section, navigation links, and the general structure.
 */
export class HomePage extends BasePage {
  readonly statUsers: Locator;
  readonly statFarms: Locator;
  readonly statArea: Locator;
  readonly statStaff: Locator;
  readonly statAnimals: Locator;
  readonly generalStats: Locator;
  readonly mainTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.statUsers = page.locator('#stat-users');
    this.statFarms = page.locator('#stat-farms');
    this.statArea = page.locator('#stat-area');
    this.statStaff = page.locator('#stat-staff');
    this.statAnimals = page.locator('#stat-animals');
    this.generalStats = page.locator('#general-stats');
    this.mainTitle = page.locator('.main-title').first();
  }

  async goto(): Promise<void> {
    await this.navigate('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Resolves once the /api/v1/statistics response has been received. */
  async waitForStats(): Promise<void> {
    await this.page.waitForResponse(
      (r) => r.url().includes('/api/v1/statistics') && r.status() === 200,
      { timeout: 10_000 },
    );
  }

  getNavLink(href: string): Locator {
    return this.page.locator(`a[href="${href}"]`).first();
  }
}
