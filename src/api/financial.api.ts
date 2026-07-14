import { APIRequestContext } from '@playwright/test';
import { BaseApi, ApiEnvelope, ApiResult } from './base.api';

export interface Transaction {
  id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  referenceId: number | null;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface Account {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export type AccountResponse = ApiEnvelope<{ account: Account }>;

/** API helper for financial endpoints. Requires a valid Bearer token. */
export class FinancialApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  getAccount(token: string): Promise<ApiResult<AccountResponse>> {
    return this.get<AccountResponse>('/api/v1/financial/account', {
      Authorization: `Bearer ${token}`,
    });
  }
}

