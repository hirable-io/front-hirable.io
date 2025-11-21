/**
 * Application configuration
 * Centralizes access to environment variables and configuration values
 */

/**
 * Backend API base URL
 * Must be prefixed with NEXT_PUBLIC_ to be accessible in the browser
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';

/**
 * Get the full URL for an API endpoint
 * @param endpoint - The API endpoint path (e.g., '/auth/login')
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * API endpoints
 * Note: The API_URL already includes /api/v1 prefix, so endpoints should not include it
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  COMPANY: {
    CREATE_VACANCY: '/company/vacancy',
    LIST_VACANCIES: '/company/vacancy',
    UPDATE_VACANCY: '/company/vacancy',
    DELETE_VACANCY: '/company/vacancy',
  },
  CANDIDATE: {
    GET: '/candidate',
    UPDATE: '/candidate',
    LIST_VACANCIES: '/candidate/vacancy',
    UPLOAD_RESUME: '/candidate/resume',
  },
  USER: {
    UPLOAD_PROFILE_IMAGE: '/user/profile-image',
  },
  JOB_APPLICATION: {
    APPLY: '/job/apply',
    LIST: '/job/applications',
  },
  TAGS: '/tags',
} as const;

