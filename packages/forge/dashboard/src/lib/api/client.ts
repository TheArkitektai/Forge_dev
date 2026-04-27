const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("forge_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export const api = {
  health: () => fetchApi<{ status: string }>("/health"),
  
  // Organizations
  getOrganization: () => fetchApi<ApiResponse<Record<string, unknown>>>("/organizations"),
  
  // Projects
  getProjects: () => fetchApi<ApiResponse<Record<string, unknown>[]>>("/projects"),
  createProject: (data: Record<string, unknown>) => fetchApi<ApiResponse<Record<string, unknown>>>("/projects", { method: "POST", body: JSON.stringify(data) }),
  
  // Stories
  getStories: (projectId?: string) => fetchApi<ApiResponse<Record<string, unknown>[]>>(`/stories${projectId ? `?projectId=${projectId}` : ""}`),
  createStory: (data: Record<string, unknown>) => fetchApi<ApiResponse<Record<string, unknown>>>("/stories", { method: "POST", body: JSON.stringify(data) }),
  
  // Users
  getUsers: () => fetchApi<ApiResponse<Record<string, unknown>[]>>("/users"),
  getMe: () => fetchApi<ApiResponse<Record<string, unknown>>>("/users/me"),
  
  // Subscription
  getSubscription: () => fetchApi<ApiResponse<Record<string, unknown>>>("/subscription"),
  getUsage: () => fetchApi<ApiResponse<Record<string, unknown>>>("/subscription/usage"),
  getBudgets: () => fetchApi<ApiResponse<Record<string, unknown>[]>>("/subscription/budgets"),
};
