import axios from 'axios';

// Helper to ensure valid protocol and clean trailing slashes
const sanitizeUrl = (url) => {
  if (!url) return '';
  let clean = String(url).trim();
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean.replace(/\/+$/, '');
};

// Raw Environment Inputs
const rawApi = sanitizeUrl(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : '');
const rawBackend = sanitizeUrl(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : '');

// 1. Dynamic Backend Root URL (without /api) for media and static files
export const BACKEND_URL = (() => {
  if (rawBackend) {
    return rawBackend.replace(/\/api\/?$/, '');
  }
  if (rawApi) {
    return rawApi.replace(/\/api\/?$/, '');
  }
  // Production fallback if deployed on Vercel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://avyukt-backend.onrender.com';
  }
  return 'http://localhost:5001';
})();

// 2. Dynamic API Base URL (always ends with exactly ONE /api, never /api/api)
export const API_BASE_URL = (() => {
  return `${BACKEND_URL}/api`;
})();

// 3. Dynamic Admin Portal URL for role-based redirects
export const ADMIN_URL =
  sanitizeUrl(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ADMIN_URL : '') ||
  'https://avyuktadmin.vercel.app';

// 4. Centralized Axios Instance with Automatic JWT Token Attachment
export const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    // Defense in depth: if request URL accidentally starts with /api/, strip it to prevent /api/api
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api\//, '/');
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
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
    if (url.includes('localhost:5000') || url.includes('localhost:5001')) {
      return url.replace(/https?:\/\/localhost:(5000|5001)/, BACKEND_URL);
    }
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default API;
