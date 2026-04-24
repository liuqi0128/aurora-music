import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  payload?: unknown;
  status?: number;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message = payload?.message ?? payload?.error ?? error.message ?? '请求失败';

    return Promise.reject(new ApiError(message, status, payload));
  }
);

export async function request<T>(config: AxiosRequestConfig) {
  const response = await apiClient.request<T>(config);

  return response.data;
}
