import { APIRequestContext, APIResponse } from '@playwright/test';

/** Standard response envelope used by all Rolnopol REST endpoints. */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  timestamp: string;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiResult<T = unknown> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

/** Base class for all API helper classes. Provides typed get/post helpers. */
export abstract class BaseApi {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  protected async get<T = unknown>(path: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    const response = await this.request.get(`${this.baseUrl}${path}`, { headers });
    return this.toResult<T>(response);
  }

  protected async post<T = unknown>(
    path: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    const response = await this.request.post(`${this.baseUrl}${path}`, {
      data: body,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    return this.toResult<T>(response);
  }

  private async toResult<T>(response: APIResponse): Promise<ApiResult<T>> {
    let body: T;
    try {
      body = (await response.json()) as T;
    } catch {
      body = (await response.text()) as unknown as T;
    }
    return {
      status: response.status(),
      body,
      headers: response.headers() as Record<string, string>,
    };
  }
}
