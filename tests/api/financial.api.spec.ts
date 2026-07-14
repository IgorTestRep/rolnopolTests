import { test, expect } from '../../src/fixtures/fixtures';
import { TEST_USERS } from '../../src/data/users';

test.describe('Financial API', () => {
  test('GET /api/v1/healthcheck — platform is operational', async ({ authApi }) => {
    const res = await authApi.healthcheck();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/login — returns token inside data envelope', async ({ authApi }) => {
    const res = await authApi.login(TEST_USERS.demo.email, TEST_USERS.demo.password);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // token is nested in data, NOT at body root
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.length).toBeGreaterThan(10);
    expect(res.body.data.user.email).toBe(TEST_USERS.demo.email);
  });

  test('GET /api/v1/financial/account — returns 401/403 without authentication', async ({ financialApi }) => {
    const res = await financialApi.getAccount('');

    expect([401, 403]).toContain(res.status);
  });

  test('GET /api/v1/financial/account — returns account with balance and currency', async ({
    financialApi,
    demoToken,
  }) => {
    const res = await financialApi.getAccount(demoToken);

    expect(res.status).toBe(200);
    const { account } = res.body.data;
    expect(typeof account.balance).toBe('number');
    expect(account.balance).toBeGreaterThanOrEqual(0);
    expect(account.currency).toBe('ROL');
  });

  test('GET /api/v1/financial/account — transactions array is non-empty', async ({
    financialApi,
    demoToken,
  }) => {
    const res = await financialApi.getAccount(demoToken);

    expect(res.status).toBe(200);
    const { transactions } = res.body.data.account;
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);

    const first = transactions[0];
    expect(['income', 'expense', 'transfer']).toContain(first.type);
    expect(first.amount).toBeGreaterThan(0);
    expect(typeof first.balanceBefore).toBe('number');
    expect(typeof first.balanceAfter).toBe('number');
  });

  test('GET /api/v1/users/profile — returns user data with valid token', async ({ authApi, demoToken }) => {
    const res = await authApi.getProfile(demoToken);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_USERS.demo.email);
    expect(typeof res.body.data.id).toBe('number');
    expect(res.body.data.isActive).toBe(true);
  });

  test('GET /api/v1/users/profile — returns 401/403 without a token', async ({ authApi }) => {
    const res = await authApi.getProfile('');

    expect([401, 403]).toContain(res.status);
  });
});

