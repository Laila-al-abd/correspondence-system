// src/lib/api/identity.ts
import apiClient from './axios-client';
import Cookies from 'js-cookie';
import {
  RegisterUserDto,
  LoginDto,
  LoginResponse,
  RegisterResponse,
  EffectivePermissionsResponse,
} from '@/types/identity';

/**
 * All methods here reject with ApiError (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on .code, not .message.
 */
export const identityApi = {
  /**
   * Public self-registration for external applicants.
   * POST /auth/register
   */
  register: async (dto: RegisterUserDto): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', dto);
    return data;
  },

  /**
   * Authenticates and persists the returned access token to the auth_token
   * cookie that axios-client reads on every request and clears on 401.
   * POST /auth/login
   */
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', dto);
    // expiresIn is assumed to be seconds (standard JWT convention) — confirm
    // against the backend. js-cookie's `expires` wants days.
    Cookies.set('auth_token', data.accessToken, { expires: data.expiresIn / 86400 });
    return data;
  },

  /**
   * Effective permission codes for the currently authenticated user.
   * GET /auth/me/permissions
   */
  getMyPermissions: async (): Promise<EffectivePermissionsResponse> => {
    const { data } = await apiClient.get<EffectivePermissionsResponse>('/auth/me/permissions');
    return data;
  },
};