import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!user) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/invite'];
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isPublicPath) {
        loadUser();
      }
    }
  }, []); // Remove user dependency to avoid loops

  const loadUser = async () => {
    // Extra safety check
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = await authApi.getCurrentUser();
      console.log('User loaded:', userData);
      setUser(userData);
      return userData;
    } catch (error: any) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/invite'];
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isPublicPath) {
        console.error('Failed to load user:', error);
      }
      storeLogout();
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      setUser(response.user);
      await loadUser();
      
      return { success: true };
    } catch (error: any) {
      console.error('Login API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      const response = await authApi.register({
        ...data,
        password2: data.password,
      });
      
      setUser(response.user);
      await loadUser();
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  };
}