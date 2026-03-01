const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type Goal = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
};

const TOKEN_KEY = "devtrackr_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}



export async function fetchGoals() {
  return apiFetch("/goals");
}

export async function createGoal(payload: { title: string; description?: string | null }) {
  return apiFetch("/goals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteGoal(goalId: number): Promise<void> {
  await apiFetch(`/goals/${goalId}`, { method: "DELETE" });
}

export async function updateGoal(
  goalId: number,
  input: { title?: string; description?: string | null }
): Promise<Goal> {
  return apiFetch(`/goals/${goalId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export type Task = {
  id: number;
  goal_id: number;
  title: string;
  is_done: boolean;
  created_at: string;
};

export async function fetchTasks(goalId: number): Promise<Task[]> {
  return apiFetch(`/goals/${goalId}/tasks`);
}

export async function createTask(goalId: number, input: { title: string }): Promise<Task> {
  return apiFetch(`/goals/${goalId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTask(
  taskId: number,
  input: { title?: string; is_done?: boolean }
): Promise<Task> {
  return apiFetch(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
}

export type TokenResponse = { access_token: string; token_type: string };

export type User = {
  id: number;
  email: string;
  created_at: string;
};

export async function registerUser(input: { email: string; password: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function loginUser(input: { email: string; password: string }): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", input.email);
  body.set("password", input.password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as TokenResponse;
  setToken(data.access_token); // ✅ IMPORTANT
  return data;
}

export async function fetchMe(): Promise<User> {
  return apiFetch("/auth/me");
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(options.headers);

  // Only set JSON content-type if the caller didn't already set it
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  if (res.status === 401) {
    setToken(null);
    // optional: force UI reset
    window.location.reload();
  }

  // Some endpoints might return empty body (204)
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}




