import axios from 'axios';

// Dynamic API Base URL Setup (Supports Vite, Create-React-App, and Production Env)
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:5001/api';

// Dynamic Backend Root URL (without /api) for media and static files
export const BACKEND_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  (API_BASE_URL ? API_BASE_URL.replace(/\/api\/?$/, '') : '') ||
  'http://localhost:5001';

// Dynamic Admin Portal URL for role-based redirects
export const ADMIN_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_URL) ||
  'http://localhost:5174';

// Centralized Axios Instance with Automatic JWT Token Attachment
export const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Safe Image URL Resolver (resolves relative uploads, localhost fallbacks, and absolute URLs)
export const getImageSrc = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If an image URL was stored with old localhost:5000/5001 in production, rewrite to current BACKEND_URL
    if (url.includes('localhost:5000') || url.includes('localhost:5001')) {
      return url.replace(/https?:\/\/localhost:(5000|5001)/, BACKEND_URL);
    }
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default API;
