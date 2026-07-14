import { APIRequestContext } from '@playwright/test';
import { BaseApi, ApiEnvelope, ApiResult } from './base.api';

export interface User {
  id: number;
  username: string;
  displayedName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface LoginData {
  user: User;
  token: string;
  expiration: { hours: number };
  loginTime: string;
}

export type LoginResponse   = ApiEnvelope<LoginData>;
export type ProfileResponse = ApiEnvelope<User>;

/** API helper for authentication-related endpoints. */
export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  login(email: string, password: string): Promise<ApiResult<LoginResponse>> {
    return this.post<LoginResponse>('/api/v1/login', { email, password });
  }

  logout(token: string): Promise<ApiResult<ApiEnvelope<null>>> {
    return this.post('/api/v1/logout', {}, { Authorization: `Bearer ${token}` });
  }

  getProfile(token: string): Promise<ApiResult<ProfileResponse>> {
    return this.get<ProfileResponse>('/api/v1/users/profile', {
      Authorization: `Bearer ${token}`,
    });
  }

  healthcheck(): Promise<ApiResult<ApiEnvelope<{ status: string; version: string }>>> {
    return this.get('/api/v1/healthcheck');
  }
}

