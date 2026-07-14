import { test, expect } from '../../src/fixtures/fixtures';
import type { Field } from '../../src/api/farm.api';

test.describe('Farm Domain API', () => {
  test('GET /api/v1/statistics — publicly accessible without a token', async ({ farmApi }) => {
    const res = await farmApi.getStatistics();

    expect(res.status).toBe(200);
  });

  test('GET /api/v1/statistics — response contains numeric, non-negative farm metrics', async ({ farmApi }) => {
    const res = await farmApi.getStatistics();

    expect(res.status).toBe(200);
    const { users, farms, area, staff, animals } = res.body;

    for (const [key, value] of Object.entries({ users, farms, area, staff, animals })) {
      expect(typeof value, `${key} should be a number`).toBe('number');
      expect(value, `${key} should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  test('GET /api/v1/fields — returns 401/403 without a token', async ({ farmApi }) => {
    const res = await farmApi.getFields();

    expect([401, 403, 429]).toContain(res.status);
  });

  test('GET /api/v1/fields — returns list with required business fields', async ({ farmApi, demoToken }) => {
    const res = await farmApi.getFields(demoToken);

    expect(res.status).toBe(200);
    const fields = res.body.data;
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.length).toBeGreaterThan(0);

    const first = fields[0] as Field;
    expect(typeof first.id).toBe('number');
    expect(typeof first.name).toBe('string');
    expect(first.name.length).toBeGreaterThan(0);
    expect(typeof first.area).toBe('number');
    expect(first.area).toBeGreaterThan(0);
  });

  test('GET /api/v1/animals — returns 401/403 without a token', async ({ farmApi }) => {
    const res = await farmApi.getAnimals();

    expect([401, 403, 429]).toContain(res.status);
  });

  test('GET /api/v1/animals — returns list with type and amount fields', async ({ farmApi, demoToken }) => {
    const res = await farmApi.getAnimals(demoToken);

    expect(res.status).toBe(200);
    const animals = res.body.data;
    expect(Array.isArray(animals)).toBe(true);
    expect(animals.length).toBeGreaterThan(0);

    const first = animals[0];
    expect(typeof first.type).toBe('string');
    expect(typeof first.amount).toBe('number');
    expect(first.amount).toBeGreaterThan(0);
  });

  test('GET /api/v1/staff — returns 401/403 without a token', async ({ farmApi }) => {
    const res = await farmApi.getStaff();

    expect([401, 403, 429]).toContain(res.status);
  });

  test('GET /api/v1/staff — returns list with name, surname and age', async ({ farmApi, demoToken }) => {
    const res = await farmApi.getStaff(demoToken);

    expect(res.status).toBe(200);
    const members = res.body.data;
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);

    const first = members[0];
    expect(typeof first.name).toBe('string');
    expect(typeof first.surname).toBe('string');
    expect(typeof first.age).toBe('number');
    expect(first.age).toBeGreaterThan(0);
  });

  test('GET /api/v1/marketplace — requires authentication (returns 4xx without a token)', async ({ farmApi }) => {
    const res = await farmApi.getMarketplace();

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

