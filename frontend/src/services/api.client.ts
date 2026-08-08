import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://abtalks-backend.onrender.com/api/v1';
  }
  return '/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
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
    const res = await apiClient.get(`/agent/feed?page=${page}&limit=${limit}&_t=${Date.now()}`);
    return res.data;
  },
  getPersonas: async () => {
    const res = await apiClient.get(`/persona?_t=${Date.now()}`);
    return res.data;
  },
  createPersona: async (data: any) => {
    const res = await apiClient.post('/persona', data);
    return res.data;
  },
  getTopics: async (status?: string) => {
    const res = await apiClient.get(`/topics${status ? `?status=${status}&` : '?'} _t=${Date.now()}`.replace(/\s+/g, ''));
    return res.data;
  },
  getPosts: async () => {
    const res = await apiClient.get(`/posts?_t=${Date.now()}`);
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
