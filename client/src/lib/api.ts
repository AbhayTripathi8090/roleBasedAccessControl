import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Reusable HTTP client for API requests with credentials (HttpOnly cookies)
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Automatically send and receive HttpOnly JWT cookies
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || 'An unexpected error occurred', response.status, data.errors);
  }

  return data;
}
