import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const agentApi = {
  initializeAgent: async (personaId?: string) => {
    const res = await apiClient.post('/agent/init', { personaId });
    return res.data;
  },
  getFeed: async (page = 1, limit = 10) => {
    const res = await apiClient.get(`/agent/feed?page=${page}&limit=${limit}`);
    return res.data;
  },
  getPersonas: async () => {
    const res = await apiClient.get('/persona');
    return res.data;
  },
  createPersona: async (data: any) => {
    const res = await apiClient.post('/persona', data);
    return res.data;
  },
  getTopics: async (status?: string) => {
    const res = await apiClient.get(`/topics${status ? `?status=${status}` : ''}`);
    return res.data;
  },
  getPosts: async () => {
    const res = await apiClient.get('/posts');
    return res.data;
  },
  getMemory: async () => {
    const res = await apiClient.get('/memory');
    return res.data;
  },
  getSchedulerLogs: async () => {
    const res = await apiClient.get('/scheduler/logs');
    return res.data;
  }
};
