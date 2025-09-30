export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type FetchOptions = RequestInit & { next?: any };

export function api(path: string, options: FetchOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  return fetch(`${API_URL}${path}`, { ...options, headers });
}
