/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.promorang.co';

export const API_FETCH_OPTIONS: RequestInit = {
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

export async function apiCall(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  const mergedOptions: RequestInit = {
    ...API_FETCH_OPTIONS,
    ...options,
    headers: {
      ...API_FETCH_OPTIONS.headers,
      ...(options.headers || {}),
    },
  };
  return fetch(url, mergedOptions);
}
