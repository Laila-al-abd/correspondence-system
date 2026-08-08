// src/lib/api/axios-client.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { ApiError, ApiErrorBody } from '@/types/shared';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Every non-401 error from the backend is shaped by DomainExceptionFilter.
    // Normalize it so call sites can do `err instanceof ApiError` and read
    // err.code / err.traceId instead of digging into error.response.data.
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.code && body?.message) {
      return Promise.reject(new ApiError(error.response.status, body));
    }

    // Network errors, timeouts, CORS failures, etc. never reached the filter.
    return Promise.reject(error);
  }
);

export default apiClient;