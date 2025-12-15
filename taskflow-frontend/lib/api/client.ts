import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const isAuthEndpoint = config.url?.includes('/auth/login') ||
                            config.url?.includes('/auth/register') ||
                            config.url?.includes('/auth/token/refresh');

      // Send org header for all non-auth endpoints
      if (!isAuthEndpoint) {
        // Try localStorage first, then Zustand store
        const orgId = localStorage.getItem('currentOrgId');
        
        if (orgId) {
          config.headers['X-Organization-ID'] = orgId;
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }
    
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        await axios.post(
          `${API_URL}/api/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        return apiClient(originalRequest);
      } catch (refreshError) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/invite'];
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
        
        if (!isPublicPath) {
          localStorage.removeItem('currentOrgId');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);