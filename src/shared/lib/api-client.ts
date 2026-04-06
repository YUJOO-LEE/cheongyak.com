import type { ApiError } from '@/shared/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { revalidate?: number },
): Promise<T> {
  const { revalidate, ...fetchOptions } = options || {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      status: res.status,
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
    }));
    throw new ApiClientError(error);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string, options?: { revalidate?: number }) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

export { ApiClientError };
