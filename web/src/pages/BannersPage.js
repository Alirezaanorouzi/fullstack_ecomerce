import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function BannersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api("/api/banners");
        if (alive) setItems(data.items || []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load banners");
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
      <h1 style={{ marginTop: 0 }}>Home Banner Slides</h1>
      {loading ? <p>Loading…</p> : null}
      {err ? <p style={{ color: "#fecaca" }}>{err}</p> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((b) => (
          <div
            key={b._id}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(148,163,184,0.4)",
              background: "#020617",
            }}
          >
            <div style={{ height: 180, overflow: "hidden" }}>
              <img
                src={b.image}
                alt={b.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 800 }}>{b.title}</div>
              {b.subtitle ? (
                <div style={{ color: "#9ca3af", fontSize: 13 }}>{b.subtitle}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

