import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../state/cart";

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api(`/api/products/${id}`);
        if (alive) setP(data);
      } catch (e) {
        if (alive) setErr(e.message || "خطا در بارگذاری محصول");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <p>در حال بارگذاری…</p>;
  if (err) return <p style={{ color: "#ffb4b4" }}>{err}</p>;
  if (!p) return null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Link to="/" style={{ color: "#b8c3da" }}>
        → بازگشت
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.03)",
            height: 260,
          }}
        >
          {p.image ? (
            <img src={p.image} alt={p.name} style={{ width: "90%", height: "90%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
              بدون تصویر
            </div>
          )}
        </div>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>{p.name}</h1>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 10 }}>${p.price}</div>
          <p style={{ color: "#b8c3da", lineHeight: 1.6 }}>{p.description || "توضیحی موجود نیست."}</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
            <button
              onClick={() => add(p, 1)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "#e7ecf5",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              افزودن به سبد
            </button>
            <Link to="/cart" style={{ color: "#e7ecf5", textDecoration: "none", fontWeight: 800 }}>
              ← مشاهده سبد خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
