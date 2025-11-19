import { apiClient } from './client';
import { Organization, OrganizationMember } from '@/types';

export const organizationsApi = {
  list: async (): Promise<Organization[]> => {
    const response = await apiClient.get('/organizations/');
    return response.data;
  },

  get: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/organizations/${id}/`);
    return response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<Organization> => {
    const response = await apiClient.post('/organizations/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.patch(`/organizations/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}/`);
  },

  getMembers: async (id: string): Promise<OrganizationMember[]> => {
    const response = await apiClient.get(`/organizations/${id}/members/`);
    return response.data;
  },

  inviteMember: async (orgId: string, email: string, role: string): Promise<void> => {
    await apiClient.post(`/organizations/${orgId}/invite/`, { email, role, organization: orgId });
  },

  acceptInvitation: async (token: string): Promise<Organization> => {
    const response = await apiClient.post('/organizations/accept_invitation/', { token });
    return response.data.organization;
  },

  updateMemberRole: async (orgId: string, memberId: string, role: string): Promise<void> => {
    await apiClient.patch(`/organizations/${orgId}/members/${memberId}/`, { role });
  },

  removeMember: async (orgId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/members/${memberId}/`);
  },

  leave: async (id: string): Promise<void> => {
    await apiClient.post(`/organizations/${id}/leave/`);
  },
};