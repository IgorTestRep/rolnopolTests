import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { FinancialPage } from '../pages/financial.page';
import { StaffFieldsPage } from '../pages/staff-fields.page';
import { AuthApi } from '../api/auth.api';
import { FinancialApi } from '../api/financial.api';
import { FarmApi } from '../api/farm.api';
import { TEST_USERS } from '../data/users';

interface RolnopolFixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  financialPage: FinancialPage;
  staffFieldsPage: StaffFieldsPage;
  authApi: AuthApi;
  financialApi: FinancialApi;
  farmApi: FarmApi;
  /** A valid Bearer token for the demo user, cleaned up after the test. */
  demoToken: string;
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

export const test = base.extend<RolnopolFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  financialPage: async ({ page }, use) => {
    await use(new FinancialPage(page));
  },

  staffFieldsPage: async ({ page }, use) => {
    await use(new StaffFieldsPage(page));
  },

  authApi: async ({ request }, use) => {
    await use(new AuthApi(request, BASE_URL));
  },

  financialApi: async ({ request }, use) => {
    await use(new FinancialApi(request, BASE_URL));
  },

  farmApi: async ({ request }, use) => {
    await use(new FarmApi(request, BASE_URL));
  },

  /**
   * Logs in as the demo user before the test and revokes the token afterwards.
   * Token is stored in res.body.data.token (wrapped API envelope).
   */
  demoToken: async ({ request }, use) => {
    const api = new AuthApi(request, BASE_URL);
    const res = await api.login(TEST_USERS.demo.email, TEST_USERS.demo.password);
    const token = res.body?.data?.token;
    if (!token) {
      throw new Error(`demoToken fixture: login failed (HTTP ${res.status})`);
    }
    await use(token);
    await api.logout(token).catch(() => undefined); // best-effort cleanup
  },
});

export { expect };
