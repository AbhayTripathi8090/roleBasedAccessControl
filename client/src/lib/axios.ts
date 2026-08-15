import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiClientError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Reusable Axios Client configured for WorkFlow RBAC API
 * Includes HttpOnly credentials and centralized error interception.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables HttpOnly cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Centralized API Error Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const responseData = error.response.data;
      const statusCode = error.response.status;
      const message = responseData?.message || error.message || 'An unexpected API error occurred';
      const errors = responseData?.errors || [];

      return Promise.reject(new ApiClientError(message, statusCode, errors));
    }

    if (error.request) {
      return Promise.reject(
        new ApiClientError('No response received from WorkFlow server. Please check network connection.', 503)
      );
    }

    return Promise.reject(new ApiClientError(error.message || 'API request initialization error', 500));
  }
);

export default apiClient;
