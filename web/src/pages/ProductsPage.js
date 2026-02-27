import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import "./products.css";
import ProductGrid from "../components/ProductGrid";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const category = useMemo(() => (searchParams.get("category") || "").trim(), [searchParams]);
  const mode = useMemo(() => (searchParams.get("mode") || "").trim(), [searchParams]);

  async function load(next = {}) {
    setLoading(true);
    setErr(null);
    try {
      const nextQ = typeof next.q === "string" ? next.q : q;
      const nextCategory = typeof next.category === "string" ? next.category : category;
      const nextMode = typeof next.mode === "string" ? next.mode : mode;

      if (nextMode === "best") {
        const data = await api("/api/products/best-sellers");
        setItems(data.items || []);
        return;
      }

      const qs = new URLSearchParams();
      if (nextQ) qs.set("q", nextQ);
      if (nextCategory) qs.set("category", nextCategory);
      const data = await api(`/api/products?${qs.toString()}`);
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message || "خطا در بارگذاری محصولات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const urlQ = (searchParams.get("q") || "").trim();
    setQ(urlQ);
    load({ q: urlQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div>
      <div className="pageHead">
        <div>
          <h1 className="h1" style={{ marginBottom: 6 }}>
            محصولات
          </h1>
          <div style={{ color: "#9ca3af", fontSize: 13 }}>
            {mode === "best" ? "پرفروش‌ترین‌ها" : category ? `دسته‌بندی: ${category}` : "همه محصولات"}
          </div>
        </div>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            const sp = new URLSearchParams(searchParams);
            if (q) sp.set("q", q);
            else sp.delete("q");
            sp.delete("mode");
            setSearchParams(sp);
          }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو..." />
          <button type="submit">جستجو</button>
        </form>
      </div>

      {loading ? <p>در حال بارگذاری…</p> : null}
      {err ? <p className="err">{err}</p> : null}

      {!loading ? <ProductGrid items={items} /> : null}
    </div>
  );
}
