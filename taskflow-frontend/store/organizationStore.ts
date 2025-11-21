import { create } from 'zustand';
import { Organization } from '@/types';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  currentOrganization: null,
  
  setOrganizations: (orgs) => set({ organizations: orgs }),
  
  setCurrentOrganization: (org) => {
    if (org) {
      localStorage.setItem('currentOrgId', org.id);
    } else {
      localStorage.removeItem('currentOrgId');
    }
    set({ currentOrganization: org });
  },
  
  addOrganization: (org) => set((state) => ({
    organizations: [...state.organizations, org],
  })),
  
  updateOrganization: (id, data) => set((state) => ({
    organizations: state.organizations.map((org) =>
      org.id === id ? { ...org, ...data } : org
    ),
    currentOrganization: state.currentOrganization?.id === id
      ? { ...state.currentOrganization, ...data }
      : state.currentOrganization,
  })),
  
  removeOrganization: (id) => set((state) => ({
    organizations: state.organizations.filter((org) => org.id !== id),
    currentOrganization: state.currentOrganization?.id === id
      ? null
      : state.currentOrganization,
  })),
}));