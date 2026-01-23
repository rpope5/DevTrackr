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
