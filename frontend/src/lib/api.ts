import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — clear token and redirect to login
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  plan: string;
  isAdmin: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  plan: string;
  isAdmin: boolean;
  agentCount: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const LlmProvider = {
  OpenAi: 0,
  Anthropic: 1,
  Gemini: 2,
} as const;
export type LlmProvider = (typeof LlmProvider)[keyof typeof LlmProvider];

export const LlmModel = {
  Gpt4o: 0,
  Gpt4oMini: 1,
  Claude35Sonnet: 2,
  Claude3Haiku: 3,
  Gemini15Pro: 4,
  Gemini15Flash: 5,
} as const;
export type LlmModel = (typeof LlmModel)[keyof typeof LlmModel];

export interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  embedToken: string;
  status: 'Active' | 'Inactive' | 'Training';
  llmProvider: LlmProvider;
  llmModel: LlmModel;
  createdAt: string;
}

export interface AgentPayload {
  name: string;
  description: string;
  instructions?: string;
  llmProvider: LlmProvider;
  llmModel: LlmModel;
  apiKey?: string;
}

export interface BillingUsage {
  plan: string;
  messagesUsed: number;
  messagesLimit: number;
  agentsUsed: number;
  agentsLimit: number;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ data: AuthResponse }>('/auth/login', { email, password }).then(unwrap),

  register: (email: string, password: string) =>
    apiClient.post<{ data: AuthResponse }>('/auth/register', { email, password }).then(unwrap),

  me: () =>
    apiClient.get<{ data: User }>('/auth/me').then(unwrap),
};

export const adminApi = {
  users: () =>
    apiClient.get<{ data: AdminUser[] }>('/admin/users').then(unwrap),
  updatePlan: (userId: string, plan: string) =>
    apiClient.put(`/admin/users/${userId}/plan`, { plan }),
};

export const agentsApi = {
  list: () =>
    apiClient.get<{ data: Agent[] }>('/agents').then(unwrap),

  create: (payload: AgentPayload) =>
    apiClient.post<{ data: Agent }>('/agents', payload).then(unwrap),

  update: (id: string, payload: Partial<AgentPayload>) =>
    apiClient.put<{ data: Agent }>(`/agents/${id}`, payload).then(unwrap),

  remove: (id: string) =>
    apiClient.delete(`/agents/${id}`),
};

export interface KnowledgeSource {
  id: string;
  agentId: string;
  type: string;
  status: string;
  sourceUrl: string | null;
  createdAt: string;
}

export const knowledgeApi = {
  list: (agentId: string) =>
    apiClient.get<{ data: KnowledgeSource[] }>(`/agents/${agentId}/knowledge`).then(unwrap),

  add: (agentId: string, payload: { type: string; content?: string; sourceUrl?: string }) =>
    apiClient.post<{ data: KnowledgeSource }>(`/agents/${agentId}/knowledge`, payload).then(unwrap),

  remove: (agentId: string, sourceId: string) =>
    apiClient.delete(`/agents/${agentId}/knowledge/${sourceId}`),
};

export const billingApi = {
  usage: () =>
    apiClient.get<{ data: BillingUsage }>('/billing/usage').then(unwrap),

  checkout: (plan: string) =>
    apiClient.post<{ data: { url: string } }>(`/billing/checkout/${plan}`).then(unwrap),
};
