import type { AuthResponse } from '../../../shared/api/auth.types';

import {
  saveAuthTokens,
} from '../../../shared/api/auth-token-storage';

import {
  apiRequest,
  refreshSession,
} from '../../../shared/api/http';

export type UserRole =
  | 'customer'
  | 'contractor'
  | 'admin';

export interface SelfResponse {
  id: string;
  phone: string;
  roles: UserRole[];
  status:
    | 'pending_verification'
    | 'active'
    | 'blocked';

  name?: string;
  city?: string;
  company_name?: string;
  email?: string;
  telegram_linked?: boolean;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  roles: UserRole[];
  name?: string;
  city?: string;
  company_name?: string;
}

export async function login(
  payload: LoginRequest
) {
  const response =
    await apiRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: payload,
        auth: false,
        retryOnUnauthorized: false,
      }
    );

  await saveAuthTokens(
    response.access_token,
    response.refresh_token
  );

  return response;
}

export async function register(
  payload: RegisterRequest
) {
  const response =
    await apiRequest<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: payload,
        auth: false,
        retryOnUnauthorized: false,
      }
    );

  await saveAuthTokens(
    response.access_token,
    response.refresh_token
  );

  return response;
}

export async function refreshAuth() {
  return refreshSession();
}

export function getSelf() {
  return apiRequest<SelfResponse>(
    '/self',
    {
      method: 'GET',
    }
  );
}

export function logout() {
  return apiRequest<void>(
    '/auth/logout',
    {
      method: 'POST',
    }
  );
}