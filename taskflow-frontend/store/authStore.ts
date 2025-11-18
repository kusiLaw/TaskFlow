import { create } from 'zustand';
import { User, Organization } from '@/types';

interface AuthState {
  user: User | null;
  currentOrg: Organization | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setCurrentOrg: (org: Organization | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentOrg: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setCurrentOrg: (org) => {
    if (org) {
      localStorage.setItem('currentOrgId', org.id);
    } else {
      localStorage.removeItem('currentOrgId');
    }
    set({ currentOrg: org });
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentOrgId');
    set({ user: null, currentOrg: null, isAuthenticated: false });
  },
}));
