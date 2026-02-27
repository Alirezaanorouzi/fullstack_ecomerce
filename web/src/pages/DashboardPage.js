import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import ProductGrid from "../components/ProductGrid";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [err, setErr] = useState(null);
  const [cats, setCats] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [quick, setQuick] = useState("best");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    let alive = true;
    (async () => {
      try {
        const data = await api("/api/admin/stats", { token });
        if (alive) setStats(data);
      } catch (e) {
        if (alive) setErr(e.message || "خطا در بارگذاری آمار");
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, user?.isAdmin]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api("/api/banners");
        if (alive) setBanners(data.items || []);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api("/api/categories");
        if (alive) setCats(data.items || []);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (!menuOpen) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const quickLinks = useMemo(
    () => [
      { key: "qa", label: "سوالی دارید؟" },
      { key: "best", label: "پرفروش‌ترین‌ها" },
      { key: "digital", label: "کالای دیجیتال" },
    ],
    []
  );
  const [showQa, setShowQa] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingProducts(true);
      try {
        if (quick === "qa") {
          if (alive) setProducts([]);
          return;
        }
        if (quick === "digital") {
          const data = await api(`/api/products?category=${encodeURIComponent("Electronics")}`);
          if (alive) setProducts(data.items || []);
          return;
        }
        const data = await api("/api/products/best-sellers");
        if (alive) setProducts(data.items || []);
      } finally {
        if (alive) setLoadingProducts(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [quick]);

  const active = banners.length > 0 ? banners[index % banners.length] : null;

  function swipe(dir) {
    if (!banners.length) return;
    setIndex((prev) => {
      const next = (prev + dir + banners.length) % banners.length;
      return next;
    });
  }

  const TAB_ENDPOINTS = {
    users: "/api/admin/users",
    orders: "/api/orders",
    products: "/api/products",
    reviews: "/api/admin/reviews",
  };

  async function handleStatClick(key) {
    if (activeTab === key) {
      setActiveTab(null);
      setTabData([]);
      return;
    }
    setActiveTab(key);
    setTabLoading(true);
    try {
      const data = await api(TAB_ENDPOINTS[key], { token });
      setTabData(data.items || []);
    } catch {
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ marginTop: 0 }}>داشبورد</h1>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.4)",
              background: "rgba(15,23,42,0.8)",
              color: "#e5e7eb",
              cursor: "pointer",
              fontWeight: 900,
              marginInlineEnd: 8,
            }}
            aria-label="منوی دسته‌بندی‌ها"
            title="دسته‌بندی‌ها"
          >
            ☰
          </button>
            <button
              onClick={() => navigate("/my-orders")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(15,23,42,0.8)",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="سفارش‌های من"
              title="سفارش‌های من"
            >
              🛍️
            </button>
          {menuOpen ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 46,
                width: 240,
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "#0b1220",
                padding: 10,
                zIndex: 5,
              }}
            >
               <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>دسته‌بندی‌ها</div>
              <button
                onClick={() => {
                  setShowQa(false);
                  setMenuOpen(false);
                  navigate("/products");
                }}
                style={catBtnStyle(false)}
              >
                همه
              </button>
              {cats.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    setMenuOpen(false);
                    setShowQa(false);
                    navigate(`/products?category=${encodeURIComponent(c.name)}`);
                  }}
                  style={catBtnStyle(false)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {!token || !user?.isAdmin ? (
        <p style={{ color: "#f97373" }}>برای مشاهده آمار کامل با حساب ادمین وارد شوید.</p>
      ) : err ? (
        <p style={{ color: "#f97373" }}>{err}</p>
      ) : (
        <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <StatCard label="کل کاربران" value={stats?.totalUsers ?? "–"} active={activeTab === "users"} onClick={() => handleStatClick("users")} />
          <StatCard label="کل سفارشات" value={stats?.totalOrders ?? "–"} active={activeTab === "orders"} onClick={() => handleStatClick("orders")} />
          <StatCard label="کل محصولات" value={stats?.totalProducts ?? "–"} active={activeTab === "products"} onClick={() => handleStatClick("products")} />
          <StatCard label="کل نظرات" value={stats?.totalReviews ?? "–"} active={activeTab === "reviews"} onClick={() => handleStatClick("reviews")} />
        </div>

        {activeTab && (
          <div style={{ marginBottom: 16, borderRadius: 14, border: "1px solid rgba(148,163,184,0.4)", background: "rgba(15,23,42,0.8)", padding: 14, maxHeight: 320, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>
                {activeTab === "users" && "کاربران"}
                {activeTab === "orders" && "سفارشات"}
                {activeTab === "products" && "محصولات"}
                {activeTab === "reviews" && "نظرات"}
              </div>
              <button onClick={() => { setActiveTab(null); setTabData([]); }} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            {tabLoading ? <p style={{ color: "#9ca3af" }}>در حال بارگذاری…</p> : tabData.length === 0 ? <p style={{ color: "#9ca3af" }}>داده‌ای یافت نشد.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeTab === "users" && tabData.map((u) => (
                  <div key={u._id} style={rowStyle}>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: u.isAdmin ? "#34d399" : "#60a5fa" }}>{u.isAdmin ? "ادمین" : "کاربر"}</div>
                  </div>
                ))}
                {activeTab === "orders" && tabData.map((o) => (
                  <div key={o._id} style={rowStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700 }}>{o.user?.name || "مهمان"}</span>
                      <span style={{ fontWeight: 700 }}>${o.totalPrice?.toFixed(2)}</span>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 13, display: "flex", gap: 10 }}>
                      <span>{o.orderItems?.length || 0} آیتم</span>
                      <span style={{ color: o.isPaid ? "#34d399" : "#f97373" }}>{o.isPaid ? "پرداخت شده" : "پرداخت نشده"}</span>
                      <span style={{ color: o.isDelivered ? "#34d399" : "#facc15" }}>{o.isDelivered ? "تحویل شده" : "در انتظار"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(o.createdAt).toLocaleDateString("fa-IR")}</div>
                  </div>
                ))}
                {activeTab === "products" && tabData.map((p) => (
                  <div key={p._id} style={{ ...rowStyle, display: "flex", gap: 10, alignItems: "center" }}>
                    {p.image && <img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ color: "#9ca3af", fontSize: 13 }}>${p.price?.toFixed(2)} — موجودی: {p.countInStock}</div>
                    </div>
                  </div>
                ))}
                {activeTab === "reviews" && tabData.map((r) => (
                  <div key={r._id} style={rowStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700 }}>{r.user?.name || "ناشناس"}</span>
                      <span style={{ color: "#facc15" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>{r.product?.name || "محصول حذف شده"}</div>
                    {r.comment && <div style={{ fontSize: 13, marginTop: 2 }}>{r.comment}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        {quickLinks.map((x) => (
          <button
            key={x.key}
            onClick={() => {
              if (x.key === "qa") {
                setQuick("qa");
                setShowQa(true);
              } else {
                setShowQa(false);
                setQuick(x.key);
              }
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.35)",
              background:
                quick === x.key || (showQa && x.key === "qa")
                  ? "rgba(148,163,184,0.22)"
                  : "rgba(15,23,42,0.6)",
              color: "#e5e7eb",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.4)",
          position: "relative",
          height: 250,
          background: "#020617",
        }}
      >
        {active ? (
          <>
            <img src={active.image} alt={active.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                insetInlineEnd: 32,
                top: 24,
                maxWidth: 320,
                color: "#111827",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 22,
                  marginBottom: 8,
                  textShadow: "0 1px 3px rgba(255,255,255,0.8)",
                }}
              >
                {active.title}
              </div>
              {active.subtitle ? (
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 10,
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                  }}
                >
                  {active.subtitle}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div
            style={{
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            بنری موجود نیست.
          </div>
        )}

        {banners.length > 1 ? (
          <>
            <button
              onClick={() => swipe(-1)}
              style={btnStyle("left")}
              aria-label="بنر قبلی"
            >
              ‹
            </button>
            <button
              onClick={() => swipe(1)}
              style={btnStyle("right")}
              aria-label="بنر بعدی"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 18 }}>
        {quick === "qa" ? (
          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(15,23,42,0.8)",
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>سوالی دارید؟</div>
            <div style={{ color: "#9ca3af", lineHeight: 1.7 }}>
              این بخش رو به‌صورت اسکِیل‌پذیر آماده کردم تا بعداً FAQ/چت/تیکت رو همینجا اضافه کنیم.
            </div>
          </div>
        ) : loadingProducts ? (
          <p>در حال بارگذاری…</p>
        ) : (
          <ProductGrid items={products} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 14,
        borderRadius: 14,
        border: active ? "1px solid #60a5fa" : "1px solid rgba(148,163,184,0.4)",
        background: active ? "rgba(96,165,250,0.12)" : "rgba(15,23,42,0.8)",
        cursor: onClick ? "pointer" : "default",
        transition: "border 0.15s, background 0.15s",
      }}
    >
      <div style={{ color: "#9ca3af", fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 24, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const rowStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(15,23,42,0.5)",
};

function btnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side === "left" ? "left" : "right"]: 16,
    borderRadius: "999px",
    border: "none",
    width: 32,
    height: 32,
    cursor: "pointer",
    background: "rgba(15,23,42,0.8)",
    color: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function catBtnStyle(active) {
  return {
    width: "100%",
    textAlign: "right",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.25)",
    background: active ? "rgba(148,163,184,0.22)" : "rgba(15,23,42,0.6)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 800,
    marginBottom: 6,
  };
}
