import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function App() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>DevTrackr</h1>
      <p>API status: {status}</p>
    </main>
  );
}
