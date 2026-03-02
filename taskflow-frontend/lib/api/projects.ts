import { apiClient } from './client';
import { Project, Board, Task, Comment, Attachment, Label, Activity } from '@/types';

export const projectsApi = {
  // Projects
  list: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects/');
    const data = response.data;
    
    // Handle both array and paginated responses
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object' && 'results' in data) {
      return Array.isArray(data.results) ? data.results : [];
    }
    
    console.error('Unexpected projects API response:', data);
    return [];
  },

  get: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}/`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; color?: string }): Promise<Project> => {
    const response = await apiClient.post('/projects/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.patch(`/projects/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}/`);
  },

  addMember: async (projectId: string, userId: string, role: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/add_member/`, {
      user_id: userId,
      role,
    });
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}/`);
  },

  // Boards
  getBoards: async (projectId: string): Promise<Board[]> => {
    const response = await apiClient.get(`/boards/?project=${projectId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Tasks
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/tasks/?project=${projectId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post('/tasks/', data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  moveTask: async (id: string, boardListId: string, position: number): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}/move/`, {
      board_list_id: boardListId,
      position,
    });
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/`);
  },

  // Comments
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/?task=${taskId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  createComment: async (data: { task: string; content: string; parent?: string }): Promise<Comment> => {
    const response = await apiClient.post('/comments/', data);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}/`);
  },

  // Attachments
  getAttachments: async (taskId: string): Promise<Attachment[]> => {
    const response = await apiClient.get(`/attachments/?task=${taskId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  getPresignedUploadUrl: async (filename: string, contentType: string) => {
    const response = await apiClient.post('/upload/presigned-url/', {
      filename,
      content_type: contentType,
    });
    return response.data;
  },

  uploadToS3: async (presignedData: any, file: File) => {
    const formData = new FormData();
    Object.keys(presignedData.fields).forEach((key) => {
      formData.append(key, presignedData.fields[key]);
    });
    formData.append('file', file);

    await fetch(presignedData.url, {
      method: 'POST',
      body: formData,
    });

    return presignedData.file_key;
  },

  createAttachment: async (data: {
    task: string;
    filename: string;
    file_size: number;
    content_type: string;
    file_url: string;
  }): Promise<Attachment> => {
    const response = await apiClient.post('/attachments/', data);
    return response.data;
  },

  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    const presignedData = await projectsApi.getPresignedUploadUrl(
      file.name,
      file.type
    );

    const fileKey = await projectsApi.uploadToS3(presignedData, file);

    const attachment = await projectsApi.createAttachment({
      task: taskId,
      filename: file.name,
      file_size: file.size,
      content_type: file.type,
      file_url: `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.amazonaws.com/${fileKey}`,
    });

    return attachment;
  },

  deleteAttachment: async (id: string): Promise<void> => {
    await apiClient.delete(`/attachments/${id}/`);
  },

  // Labels
  getLabels: async (projectId: string): Promise<Label[]> => {
    const response = await apiClient.get(`/labels/?project=${projectId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  createLabel: async (data: { name: string; color: string; project: string }): Promise<Label> => {
    const response = await apiClient.post('/labels/', data);
    return response.data;
  },

  deleteLabel: async (id: string): Promise<void> => {
    await apiClient.delete(`/labels/${id}/`);
  },

  // Activities
  getActivities: async (projectId: string): Promise<Activity[]> => {
    const response = await apiClient.get(`/activities/?project=${projectId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  getTaskActivities: async (taskId: string): Promise<Activity[]> => {
    const response = await apiClient.get(`/activities/?task=${taskId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Search
  searchTasks: async (projectId: string, filters: {
    search?: string;
    priority?: string;
    status?: string;
    assignee?: string;
    has_due_date?: boolean;
    overdue?: boolean;
  }): Promise<Task[]> => {
    const params = new URLSearchParams({ project: projectId });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/tasks/search/?${params.toString()}`);
    const data = response.data;
    
    if (data && typeof data === 'object' && 'results' in data) {
      return Array.isArray(data.results) ? data.results : [];
    }
    
    return Array.isArray(data) ? data : [];
  },
};