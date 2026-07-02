const API_BASE = 'http://localhost:5000/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  // Job Descriptions
  createJD: (payload: Record<string, unknown>) =>
    request('/job-descriptions', { method: 'POST', body: JSON.stringify(payload) }),

  getJD: (id: string) =>
    request(`/job-descriptions/${id}`),

  // Resumes
  createResume: (payload: Record<string, unknown>) =>
    request('/resumes', { method: 'POST', body: JSON.stringify(payload) }),

  listResumes: (jdId: string) =>
    request<any[]>(`/resumes?jd_id=${jdId}`),

  updateResume: (id: string, payload: Record<string, unknown>) =>
    request(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteResume: (id: string) =>
    request(`/resumes/${id}`, { method: 'DELETE' }),

  // Ranking Configs
  createRankingConfig: (payload: Record<string, unknown>) =>
    request('/ranking-configs', { method: 'POST', body: JSON.stringify(payload) }),

  // Ranking Results
  createRankingResults: (results: Record<string, unknown>[]) =>
    request<any[]>('/ranking-results', { method: 'POST', body: JSON.stringify(results) }),

  deleteRankingResults: (configId: string) =>
    request(`/ranking-results?config_id=${configId}`, { method: 'DELETE' }),

  getRankingResults: (configId: string) =>
    request<any[]>(`/ranking-results?config_id=${configId}`),

  // Health
  health: () => request('/health'),
};
