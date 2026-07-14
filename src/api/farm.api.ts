import { APIRequestContext } from '@playwright/test';
import { BaseApi, ApiEnvelope, ApiResult } from './base.api';

export interface Field {
  id: number;
  userId: number;
  name: string;
  area: number;
}

export interface Animal {
  id: number;
  userId: number;
  type: string;
  amount: number;
  fieldId: number | null;
  createdAt: string;
}

export interface StaffMember {
  id: number;
  userId: number;
  name: string;
  surname: string;
  age: number;
}

/**
 * Statistics is the only endpoint that does NOT use the ApiEnvelope wrapper —
 * it returns the numbers directly at the root level.
 */
export interface Statistics {
  users: number;
  farms: number;
  area: number;
  staff: number;
  animals: number;
  avgStaffAge: number;
  offers: number;
  totalValue: number;
  advanced: {
    avgAreaPerFarm: number;
    avgAnimalsPerFarm: number;
    avgStaffPerFarm: number;
    avgAnimalsPerStaff: number;
    avgOfferValue: number;
    completedTransactions: number;
    totalCompletedValue: number;
    totalActiveValue: number;
  };
}

export type FieldsResponse     = ApiEnvelope<Field[]>;
export type AnimalsResponse    = ApiEnvelope<Animal[]>;
export type StaffResponse      = ApiEnvelope<StaffMember[]>;
export type MarketplaceResponse = ApiEnvelope<unknown[]>;

/**
 * API helper for the core farming domain.
 * Covers fields, animals, staff, marketplace and the public statistics endpoint.
 */
export class FarmApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  getFields(token?: string): Promise<ApiResult<FieldsResponse>> {
    return this.get<FieldsResponse>('/api/v1/fields', this.authHeader(token));
  }

  getAnimals(token?: string): Promise<ApiResult<AnimalsResponse>> {
    return this.get<AnimalsResponse>('/api/v1/animals', this.authHeader(token));
  }

  getStaff(token?: string): Promise<ApiResult<StaffResponse>> {
    return this.get<StaffResponse>('/api/v1/staff', this.authHeader(token));
  }

  /** Public endpoint — no authentication required. */
  getStatistics(): Promise<ApiResult<Statistics>> {
    return this.get<Statistics>('/api/v1/statistics');
  }

  getMarketplace(token?: string): Promise<ApiResult<MarketplaceResponse>> {
    return this.get<MarketplaceResponse>('/api/v1/marketplace', this.authHeader(token));
  }

  private authHeader(token?: string): Record<string, string> | undefined {
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

