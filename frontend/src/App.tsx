import { useEffect, useMemo, useState } from "react";
import { createGoal, deleteGoal, fetchGoals, updateGoal, fetchTasks, createTask, updateTask, deleteTask, } from "./api";
import type { Goal, Task } from "./api";
import { CheckCircle2, Circle, Trash2, Plus, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";


type FormState = {
  title: string;
  description: string;
};


export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<number>>(new Set());

  const [tasksByGoalId, setTasksByGoalId] = useState<Record<number, Task[]>>({});
  const [tasksLoadingByGoalId, setTasksLoadingByGoalId] = useState<Record<number, boolean>>({});
  const [tasksErrorByGoalId, setTasksErrorByGoalId] = useState<Record<number, string | null>>({});
  const [newTaskTitleByGoalId, setNewTaskTitleByGoalId] = useState<Record<number, string>>({});



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
  });


  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);


  const canSubmit = useMemo(() => form.title.trim().length >= 3, [form.title]);

  const btnStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #333",
    cursor: "pointer",
    background: "transparent",
    color: "inherit",
  };

  const primaryBtnStyle: React.CSSProperties = {
    ...btnStyle,
    border: "1px solid #555",
    fontWeight: 600,
  };

  const dangerBtnStyle: React.CSSProperties = {
    ...btnStyle,
    border: "1px solid #7a2a2a",
  };


  async function loadGoals() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks(goalId: number) {
  setTasksLoadingByGoalId((m) => ({ ...m, [goalId]: true }));
  setTasksErrorByGoalId((m) => ({ ...m, [goalId]: null }));
  try {
    const tasks = await fetchTasks(goalId);
    setTasksByGoalId((m) => ({ ...m, [goalId]: tasks }));
  } catch (e) {
    setTasksErrorByGoalId((m) => ({
      ...m,
      [goalId]: e instanceof Error ? e.message : "Failed to load tasks",
    }));
  } finally {
    setTasksLoadingByGoalId((m) => ({ ...m, [goalId]: false }));
  }
}

function toggleExpanded(goalId: number) {
  setExpandedGoalIds((prev) => {
    const next = new Set(prev);
    if (next.has(goalId)) {
      next.delete(goalId);
    } else {
      next.add(goalId);
      // lazy load tasks the first time we expand
      if (!tasksByGoalId[goalId]) {
        void loadTasks(goalId);
      }
    }
    return next;
  });
}

async function handleCreateTask(goalId: number) {
  const title = (newTaskTitleByGoalId[goalId] ?? "").trim();
  if (!title) return;

  try {
    const created = await createTask(goalId, { title });
    setTasksByGoalId((m) => ({ ...m, [goalId]: [created, ...(m[goalId] ?? [])] }));
    setNewTaskTitleByGoalId((m) => ({ ...m, [goalId]: "" }));
  } catch (e) {
    setTasksErrorByGoalId((m) => ({
      ...m,
      [goalId]: e instanceof Error ? e.message : "Failed to create task",
    }));
  }
}

async function handleToggleTaskDone(goalId: number, task: Task) {
  // optimistic UI
  setTasksByGoalId((m) => ({
    ...m,
    [goalId]: (m[goalId] ?? []).map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t)),
  }));

  try {
    const updated = await updateTask(task.id, { is_done: !task.is_done });
    setTasksByGoalId((m) => ({
      ...m,
      [goalId]: (m[goalId] ?? []).map((t) => (t.id === task.id ? updated : t)),
    }));
  } catch (e) {
    // revert on failure
    setTasksByGoalId((m) => ({
      ...m,
      [goalId]: (m[goalId] ?? []).map((t) => (t.id === task.id ? task : t)),
    }));
    setTasksErrorByGoalId((m) => ({
      ...m,
      [goalId]: e instanceof Error ? e.message : "Failed to update task",
    }));
  }
}

async function handleDeleteTask(goalId: number, taskId: number) {
  // optimistic remove
  const ok =window.confirm("Delete this task? This cannot be undone.");
  if (!ok) return;
  const prev = tasksByGoalId[goalId] ?? [];
  setTasksByGoalId((m) => ({
    ...m,
    [goalId]: (m[goalId] ?? []).filter((t) => t.id !== taskId),
  }));

  try {
    await deleteTask(taskId);
  } catch (e) {
    // revert
    setTasksByGoalId((m) => ({ ...m, [goalId]: prev }));
    setTasksErrorByGoalId((m) => ({
      ...m,
      [goalId]: e instanceof Error ? e.message : "Failed to delete task",
    }));
  }
}


  useEffect(() => {
    void loadGoals();
  }, []);

  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const title = form.title.trim();
    const description = form.description.trim();

    if (title.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    try {
      const created = await createGoal({
        title,
        description: description.length ? description : undefined,
      });
      setGoals((prev) => [created, ...prev]);
      setForm({ title: "", description: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }


  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(goalId: number) {
    const title = editTitle.trim();
    const description = editDescription.trim();

    if (title.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    setBusyId(goalId);
    setError(null);
    try {
      const updated = await updateGoal(goalId, {
        title,
        description: description.length ? description : null,
      });

      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  

  async function removeGoal(goalId: number) {
    const ok = window.confirm("Delete this goal? This cannot be undone.");
    if (!ok) return;

    setBusyId(goalId);
    setError(null);
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      if (editingId === goalId) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusyId(null);
    }
  }
  

  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 24,
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 48 }}>DevTrackr</h1>
        <p style={{ marginTop: 6, opacity: 0.8 }}>
          Goals dashboard (React + FastAPI + SQLite + Alembic)
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
        {/* Create */}
        <div
          style={{
            border: "1px solid #2a2a2a",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create goal</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Title</span>
              <input className="input"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter a goal title (e.g. Finish CS assignment)"
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "transparent",
                  color: "inherit",
                }}
              />
              <small style={{ opacity: 0.7 }}>Minimum 3 characters.</small>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Description (optional)</span>
              <textarea className="input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional details, steps, or notes for this goal"
                rows={4}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "transparent",
                  color: "inherit",
                  resize: "vertical",
                }}
              />
            </label>

            <button type="submit" disabled={!canSubmit} style={{ ...primaryBtnStyle, opacity: canSubmit ? 1 : 0.5 }}>
              Create
            </button>
          </form>

          {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}
        </div>

        {/* List */}
        <div
          style={{
            border: "1px solid #2a2a2a",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ marginTop: 0 }}>Goals</h2>
            <button className="btn" onClick={() => void loadGoals()}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : goals.length === 0 ? (
            <p>No goals yet. Start by creating one on the left.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              {goals.map((g) => (
                <li
                  key={g.id}
                  style={{
                    border: "1px solid #333",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>#{g.id}</span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {editingId === g.id ? (
                        <>
                          <button
                            onClick={() => void saveEdit(g.id)}
                            disabled={busyId === g.id}
                            style={{ ...primaryBtnStyle, opacity: busyId === g.id ? 0.6 : 1 }}
                          >
                            {busyId === g.id ? "Saving…" : "Save"}
                          </button>
                          <button onClick={cancelEdit} disabled={busyId === g.id} style={btnStyle}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(g)} disabled={busyId === g.id} style={btnStyle}>
                            Edit
                          </button>
                          <button
                            onClick={() => void removeGoal(g.id)}
                            disabled={busyId === g.id}
                            style={{ ...dangerBtnStyle, opacity: busyId === g.id ? 0.6 : 1 }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === g.id ? (
                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                      <input className="input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #444",
                          background: "transparent",
                          color: "inherit",
                        }}
                      />
                      <textarea className="input"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #444",
                          background: "transparent",
                          color: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      <strong style={{ fontSize: 18 }}>{g.title}</strong>
                      {g.description ? (
                        <p style={{ margin: "6px 0 0 0", opacity: 0.85 }}>{g.description}</p>
                      ) : (
                        <p style={{ margin: "6px 0 0 0", opacity: 0.6 }}>(No description)</p>
                      )}
                    </div>
                  )}

                  <p style={{ margin: "10px 0 0 0", opacity: 0.6, fontSize: 12 }}>
                    Created: {new Date(g.created_at).toLocaleString()}
                  </p>
                  <div style={{marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong>Tasks</strong>
                      <button onClick={() => toggleExpanded(g.id)} className="btn">
                        {expandedGoalIds.has(g.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {expandedGoalIds.has(g.id) ? "Hide" : "Show"}
                      </button>
                    </div>

                    {expandedGoalIds.has(g.id) && (() => {
                      const tasks = tasksByGoalId[g.id] ?? [];
                      const doneCount = tasks.filter((t) => t.is_done).length;

                      const tasksSorted = [...tasks].sort((a, b) => {
                        if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      });

                      return (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <strong>Tasks</strong>
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  opacity: 0.85,
                                }}
                              >
                                {doneCount}/{tasks.length} done
                              </span>
                            </div>
                          </div>

                          {/* keep your existing create-task input row here */}
                          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <input className="input"
                              value={newTaskTitleByGoalId[g.id] ?? ""}
                              onChange={(e) =>
                                setNewTaskTitleByGoalId((m) => ({ ...m, [g.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void handleCreateTask(g.id);
                             }}
                             placeholder="Add a task for this goal…"
                             style={{ flex: 1 }}
                            />
                            <button
                              onClick={() => handleCreateTask(g.id)}
                              className="btn"
                              disabled={!(newTaskTitleByGoalId[g.id] ?? "").trim()}
                            >
                              <Plus size={16} /> Add
                            </button>
                          </div>

                          {tasksErrorByGoalId[g.id] && (
                            <div style={{ marginTop: 8 }}>
                              <small style={{ color: "crimson" }}>{tasksErrorByGoalId[g.id]}</small>
                            </div>
                          )}

                          <div style={{ marginTop: 10 }}>
                            {tasksLoadingByGoalId[g.id] ? (
                              <small>Loading tasks…</small>
                            ) : tasksSorted.length === 0 ? (
                              <small>No tasks yet.</small>
                            ) : (
                              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                                {tasksSorted.map((t) => (
                                  <li
                                    key={t.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 10,
                                      padding: "10px 12px",
                                      borderRadius: 10,
                                      border: "1px solid rgba(255,255,255,0.12)",
                                    }}
                                  >
                                    <label style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                                      <button
                                        onClick={() => handleToggleTaskDone(g.id, t)}
                                        className="iconBtn"
                                        aria-label={t.is_done ? "Mark not done" : "Mark done"}
                                      >
                                        {t.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                      </button>
                                      <span
                                        style={{
                                          opacity: t.is_done ? 0.6 : 1,
                                          textDecoration: t.is_done ? "line-through" : "none",
                                        }}
                                      >
                                        {t.title}
                                      </span>
                                    </label>

                                    <button onClick={() => handleDeleteTask(g.id, t.id)} className="iconBtn">
                                      <Trash2 size={18} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}