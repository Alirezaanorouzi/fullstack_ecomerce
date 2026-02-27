import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api("/api/categories");
        if (alive) setItems(data.items || []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load categories");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Category</h1>
      {loading ? <p>Loading…</p> : null}
      {err ? <p style={{ color: "#fecaca" }}>{err}</p> : null}
      <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
        {items.map((c) => (
          <li
            key={c._id}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.4)",
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>{c.name}</div>
            {c.description ? (
              <div style={{ color: "#9ca3af", fontSize: 13 }}>{c.description}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

