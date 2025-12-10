import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Organization } from '@/types';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, org: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      currentOrganization: null,
      
      setOrganizations: (organizations) => set({ organizations }),
      
      setCurrentOrganization: (org) => {
        // Always sync to localStorage
        if (org) {
          localStorage.setItem('currentOrgId', org.id);
          console.log('Set current org:', org.id, org.name); // Debug
        } else {
          localStorage.removeItem('currentOrgId');
        }
        set({ currentOrganization: org });
      },
      
      addOrganization: (org) => set((state) => ({
        organizations: [...state.organizations, org],
      })),
      
      updateOrganization: (id, updatedOrg) => set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? { ...org, ...updatedOrg } : org
        ),
        currentOrganization: state.currentOrganization?.id === id
          ? { ...state.currentOrganization, ...updatedOrg }
          : state.currentOrganization,
      })),
      
      removeOrganization: (id) => set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        currentOrganization: state.currentOrganization?.id === id
          ? state.organizations.find(o => o.id !== id) || null
          : state.currentOrganization,
      })),
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
      }),
    }
  )
);