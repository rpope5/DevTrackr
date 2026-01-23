import { useEffect, useMemo, useState } from "react";
import { createGoal, fetchGoals } from "./api";
import type { Goal } from "./api";

type FormState = {
  title: string;
  description: string;
};

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
  });

  const canSubmit = useMemo(() => form.title.trim().length >= 3, [form.title]);

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

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>DevTrackr</h1>
        <p style={{ marginTop: 6, opacity: 0.8 }}>
          Goals dashboard (React + FastAPI + SQLite + Alembic)
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Create goal</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter a goal title (e.g. Finish CS assignment)"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
              <small style={{ opacity: 0.7 }}>Minimum 3 characters.</small>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Description (optional)</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional details, steps, or notes for this goal"
                rows={4}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", resize: "vertical" }}
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              Create
            </button>
          </form>

          {error && (
            <p style={{ marginTop: 12, color: "crimson" }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ marginTop: 0 }}>Goals</h2>
            <button
              onClick={() => void loadGoals()}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : goals.length === 0 ? (
            <p>No goals yet. Start by creating one on the left.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {goals.map((g) => (
                <li key={g.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <strong>{g.title}</strong>
                      {g.description ? (
                        <p style={{ margin: "6px 0 0 0", opacity: 0.85 }}>{g.description}</p>
                      ) : (
                        <p style={{ margin: "6px 0 0 0", opacity: 0.6 }}>(No description)</p>
                      )}
                    </div>

                    <span style={{ opacity: 0.6, whiteSpace: "nowrap" }}>
                      #{g.id}
                    </span>
                  </div>

                  <p style={{ margin: "10px 0 0 0", opacity: 0.6, fontSize: 12 }}>
                    Created: {new Date(g.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
