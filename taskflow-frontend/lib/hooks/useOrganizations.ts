import { useEffect } from 'react';
import { useOrganizationStore } from '@/store/organizationStore';
import { organizationsApi } from '@/lib/api/organizations';
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
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    loadOrganizations();
  }, []); // Empty dependency array

  const loadOrganizations = async () => {
    // Extra safety check
    if (typeof window === 'undefined') return;
    
    try {
      let orgs = await organizationsApi.list();
      
      if (!Array.isArray(orgs)) {
        console.warn('Organizations is not an array, attempting to fix...');
        
        if (orgs && typeof orgs === 'object') {
          if ('results' in orgs && Array.isArray(orgs.results)) {
            orgs = orgs.results;
          } else {
            orgs = [];
          }
        } else {
          orgs = [];
        }
      }
      
      console.log('Processed organizations:', orgs);
      setOrganizations(orgs);

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
      setOrganizations([]);
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

  const updateOrg = async (id: string, data: Partial<Organization>) => {
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
    organizations: Array.isArray(organizations) ? organizations : [],
    currentOrganization,
    loadOrganizations,
    createOrganization,
    updateOrganization: updateOrg,
    deleteOrganization,
    switchOrganization,
  };
}