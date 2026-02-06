const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type Goal = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
};

export async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch(`${API_BASE_URL}/goals`);
  if (!res.ok) throw new Error(`Failed to fetch goals: ${res.status}`);
  return res.json();
}

export async function createGoal(input: {
  title: string;
  description?: string;
}): Promise<Goal> {
  const res = await fetch(`${API_BASE_URL}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create goal: ${res.status} ${text}`);
  }

  return res.json();
}

export async function deleteGoal(goalId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete goal: ${res.status} ${text}`);
  }
}

export async function updateGoal(
  goalId: number,
  input: { title?: string; description?: string | null }
): Promise<Goal> {
  const res = await fetch(`${API_BASE_URL}/goals/${goalId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update goal: ${res.status} ${text}`);
  }

  return res.json();
}

export type Task = {
  id: number;
  goal_id: number;
  title: string;
  is_done: boolean;
  created_at: string;
};

export async function fetchTasks(goalId: number): Promise<Task[]> {
  const res = await fetch(`${API_BASE_URL}/goals/${goalId}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  return res.json();
}

export async function createTask(goalId: number, input: { title: string }): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/goals/${goalId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create task: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateTask(taskId: number, input: { title?: string; is_done?: boolean }): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update task: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteTask(taskId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete task: ${res.status} ${text}`);
  }
}


