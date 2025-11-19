import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      storeLogout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      
      setUser(response.user);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
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
      
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      
      setUser(response.user);
      
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
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