import axios from 'axios';

/**
 * api.js - Centralized Axios HTTP Client for LocalFix
 *
 * Concepts Explained for Beginners:
 * 1. Axios: A promise-based HTTP client that sends requests from the browser
 *    to the backend REST API and automatically transforms JSON payloads.
 * 2. baseURL: The root path prefix applied to all relative requests (e.g., '/reports').
 * 3. Environment Variables: Vite exposes variables prefixed with 'VITE_' via
 *    import.meta.env. We provide a safe default ('http://localhost:8080/api')
 *    so development works out of the box.
 * 4. Interceptors: Middleware that inspects or transforms requests before they leave
 *    and responses before they reach the component.
 */

// Read base URL from Vite environment, falling back to local Spring Boot port 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Storage keys for auth persistence
 */
export const TOKEN_STORAGE_KEY = 'localfix_token';
export const USER_STORAGE_KEY = 'localfix_user';

/**
 * Global request interceptor:
 * Automatically injects the JWT Bearer token into the Authorization header
 * if an active session token is stored in localStorage.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response interceptor:
 * Extracts helpful error details from server responses or network failures,
 * normalizing them so UI components can display clean user-friendly alerts.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let normalizedError = {
      status: error.response?.status || 0,
      message: 'An unexpected error occurred.',
      fieldErrors: {},
      isNetworkError: false,
      isUnauthorized: false,
    };

    if (!error.response) {
      // Server is unreachable, network connection lost, or CORS blocked
      normalizedError.isNetworkError = true;
      normalizedError.message =
        'Cannot connect to the LocalFix backend server. Please verify that Spring Boot is running on port 8080.';
    } else {
      const data = error.response.data;
      const status = error.response.status;

      if (status === 400) {
        normalizedError.message = data?.message || 'Invalid request. Please check the entered data.';
        // If Spring Boot GlobalExceptionHandler returned field errors:
        if (data?.errors && typeof data.errors === 'object') {
          normalizedError.fieldErrors = data.errors;
        }
      } else if (status === 401) {
        normalizedError.isUnauthorized = true;
        normalizedError.message =
          data?.message || 'Authentication required or session expired. Please log in again.';
      } else if (status === 403) {
        normalizedError.message =
          data?.message || 'Access Denied: You do not have permission to perform this action.';
      } else if (status === 404) {
        normalizedError.message = data?.message || 'The requested resource was not found.';
      } else if (status === 500) {
        normalizedError.message =
          'A server-side error occurred. Please try again later or check backend logs.';
      } else {
        normalizedError.message = data?.message || `Request failed with HTTP status ${status}.`;
      }
    }

    return Promise.reject(normalizedError);
  }
);

/**
 * Report API Endpoints
 */
export const reportsApi = {
  /**
   * GET /api/reports
   * Fetches all reports, ordered newest first.
   * Supports optional query filtering by category and status.
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },

  /**
   * GET /api/reports/{id}
   * Fetches a single report by its unique ID.
   */
  getById: async (id) => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  /**
   * GET /api/reports/my
   * Fetches only the reports submitted by the currently authenticated user.
   */
  getMyReports: async () => {
    const response = await apiClient.get('/reports/my');
    return response.data;
  },

  /**
   * POST /api/reports
   * Creates a new civic report in the database.
   * Expects: { title, description, category, severity, location, imageUrl }
   */
  create: async (reportData) => {
    const response = await apiClient.post('/reports', reportData);
    return response.data;
  },

  /**
   * PATCH /api/reports/{id}
   * Partially updates an existing report's status or details.
   * Sends X-Admin-Role: ADMIN to authenticate administrative access.
   * Expects: { status?: 'PENDING'|'IN_PROGRESS'|'RESOLVED', severity?, ... }
   */
  update: async (id, updateData) => {
    const response = await apiClient.patch(`/reports/${id}`, updateData, {
      headers: {
        'X-Admin-Role': 'ADMIN',
      },
    });
    return response.data;
  },

  /**
   * POST /api/reports/images
   * Upload an image file via multipart/form-data (Phase 8).
   * @param {File} file - Selected image File object
   * @returns {Promise<{ imageUrl: string, fileName: string, fileSize: number, contentType: string }>}
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/reports/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Helper to format an image URL for frontend rendering.
   * Resolves backend-relative paths (e.g. /api/reports/images/xyz.jpg)
   * to full URLs against the Spring Boot host (http://localhost:8080),
   * while preserving external URLs (https://...) and data URIs (data:...).
   */
  formatImageUrl: (imageUrl) => {
    if (!imageUrl) return null;
    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:')
    ) {
      return imageUrl;
    }
    const baseHost = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${baseHost}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  },

  /**
   * Health endpoints for backend connectivity verification
   */
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getDbHealth: async () => {
    const response = await apiClient.get('/health/db');
    return response.data;
  },
};

/**
 * Authentication API Endpoints (Phase 9.5)
 */
export const authApi = {
  /**
   * POST /api/auth/register
   * Registers a new citizen user account.
   * Expects: { name, email, password }
   * Returns: { token, id, name, email, role }
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * POST /api/auth/login
   * Authenticates user or administrator.
   * Expects: { email, password }
   * Returns: { token, id, name, email, role }
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * GET /api/auth/me
   * Fetches profile data of currently authenticated user using JWT token.
   * Returns: { id, name, email, role, createdAt }
   */
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default apiClient;
