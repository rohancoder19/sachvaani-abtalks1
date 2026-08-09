import axios from 'axios';

import { FeedResponse, InitAgentResponse } from '../types/agent';

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
  initializeAgent: async (personaId?: string): Promise<InitAgentResponse> => {
    const res = await apiClient.post('/agent/init', { personaId });
    return res.data;
  },
  initializeAgentWithPersona: async (persona: { name: string; domain: string }): Promise<InitAgentResponse> => {
    const res = await apiClient.post('/agent/init', { persona });
    return res.data;
  },
  getFeed: async (agentId?: string, page = 1, limit = 20): Promise<FeedResponse> => {
    const activeAgentId = agentId || localStorage.getItem('activeAgentId') || 'ada-ai-security';
    const res = await apiClient.get(`/agent/feed?agentId=${encodeURIComponent(activeAgentId)}&page=${page}&limit=${limit}&_t=${Date.now()}`);
    return {
      posts: Array.isArray(res.data?.posts) ? res.data.posts : (Array.isArray(res.data?.data) ? res.data.data : []),
      pagination: res.data?.pagination
    };
  },
  getAgentFeedByAgentId: async (agentId: string, page = 1, limit = 20): Promise<FeedResponse> => {
    const res = await apiClient.get(`/agent/feed?agentId=${encodeURIComponent(agentId)}&page=${page}&limit=${limit}&_t=${Date.now()}`);
    return {
      posts: Array.isArray(res.data?.posts) ? res.data.posts : (Array.isArray(res.data?.data) ? res.data.data : []),
      pagination: res.data?.pagination
    };
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
