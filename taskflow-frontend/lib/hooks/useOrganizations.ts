import { useEffect } from 'react';
import { useOrganizationStore } from '@/store/organizationStore';
import { organizationsApi } from '@/api/organizations';
import { Organization } from '@/types';

export function useOrganizations() {
  const {
    organizations,
    currentOrganization,
    setOrganizations,
    setCurrentOrganization,
    addOrganization,
    updateOrganization,
    removeOrganization,
  } = useOrganizationStore();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await organizationsApi.list();
      setOrganizations(orgs);

      // Set current organization if stored in localStorage
      const storedOrgId = localStorage.getItem('currentOrgId');
      if (storedOrgId) {
        const current = orgs.find((org) => org.id === storedOrgId);
        if (current) {
          setCurrentOrganization(current);
        } else if (orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
        }
      } else if (orgs.length > 0) {
        setCurrentOrganization(orgs[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const createOrganization = async (data: { name: string; description?: string }) => {
    try {
      const newOrg = await organizationsApi.create(data);
      addOrganization(newOrg);
      setCurrentOrganization(newOrg);
      return { success: true, organization: newOrg };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || 'Failed to create organization',
      };
    }
  };

  const updateOrg = async (id: string, data: Partial<any>) => {
    try {
      const updated = await organizationsApi.update(id, data);
      updateOrganization(id, updated);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || 'Failed to update organization',
      };
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await organizationsApi.delete(id);
      removeOrganization(id);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || 'Failed to delete organization',
      };
    }
  };

  const switchOrganization = (org: Organization) => {
    setCurrentOrganization(org);
  };

  return {
    organizations,
    currentOrganization,
    loadOrganizations,
    createOrganization,
    updateOrganization: updateOrg,
    deleteOrganization,
    switchOrganization,
  };
}