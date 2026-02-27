import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";

export default function MyOrdersPage() {
  const { token, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await api("/api/orders/mine", { token });
        if (alive) setOrders(data.items || []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load orders");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token, isAuthed]);

  const paidOrders = orders.filter((o) => o.isPaid);
  const unpaidOrders = orders.filter((o) => !o.isPaid);

  return (
    <div>
      <h1 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>📦</span> سفارش‌های من
      </h1>
      <p style={{ color: "#9ca3af", marginTop: -8, marginBottom: 20, fontSize: 14 }}>
        تاریخچه سفارش‌ها و وضعیت پرداخت
      </p>

      {loading && <p>در حال بارگذاری…</p>}
      {err && <p style={{ color: "#fecaca" }}>{err}</p>}

      {!loading && orders.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48 }}>🛍️</div>
          <p style={{ color: "#9ca3af", marginTop: 10 }}>هنوز سفارشی ثبت نشده است</p>
          <button onClick={() => navigate("/products")} style={shopBtnStyle}>
            مشاهده محصولات
          </button>
        </div>
      )}

      {paidOrders.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>
            <span style={{ color: "#34d399" }}>✅</span> سفارش‌های پرداخت شده ({paidOrders.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {paidOrders.map((order) => (
              <MyOrderCard key={order._id} order={order} />
            ))}
          </div>
        </>
      )}

      {unpaidOrders.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>
            <span style={{ color: "#fbbf24" }}>⏳</span> سفارش‌های در انتظار پرداخت ({unpaidOrders.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {unpaidOrders.map((order) => (
              <MyOrderCard key={order._id} order={order} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MyOrderCard({ order }) {
  const totalItems = order.orderItems?.reduce((sum, it) => sum + (it.qty || 0), 0) ?? 0;
  const paidDate = order.paidAt ? new Date(order.paidAt).toLocaleDateString("fa-IR") : null;
  const createdDate = new Date(order.createdAt).toLocaleDateString("fa-IR");

  let statusBadge;
  if (order.isDelivered) {
    statusBadge = <span style={badgeStyle("#34d399", "rgba(52,211,153,0.15)")}>تحویل داده شده</span>;
  } else if (order.isPaid) {
    statusBadge = <span style={badgeStyle("#60a5fa", "rgba(96,165,250,0.15)")}>در حال ارسال</span>;
  } else {
    statusBadge = <span style={badgeStyle("#fbbf24", "rgba(251,191,36,0.15)")}>در انتظار پرداخت</span>;
  }

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>سفارش #{order._id.slice(-6)}</span>
          {statusBadge}
        </div>
        <div style={{ fontWeight: 900, fontSize: 18, color: "#34d399" }}>
          ${order.totalPrice?.toFixed(2)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        {order.orderItems?.map((item, i) => (
          <div key={i} style={itemThumbnailStyle}>
            {item.image ? (
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
            ) : (
              <div style={{ color: "#6b7280", fontSize: 11 }}>بدون تصویر</div>
            )}
          </div>
        ))}
      </div>

      <div style={cardItemsListStyle}>
        {order.orderItems?.map((item, i) => (
          <div key={i} style={itemRowStyle}>
            <span style={{ color: "#e5e7eb", fontWeight: 600 }}>{item.name}</span>
            <span style={{ color: "#9ca3af" }}>×{item.qty}</span>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div style={cardFooterStyle}>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>
          {totalItems} آیتم • تاریخ ثبت: {createdDate}
        </div>
        {paidDate && (
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            💳 پرداخت شده: {paidDate}
            {order.paymentMethod && ` — ${order.paymentMethod}`}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(15,23,42,0.85)",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
};

function badgeStyle(color, bg) {
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    color,
    background: bg,
  };
}

const itemThumbnailStyle = {
  width: 56,
  height: 56,
  borderRadius: 10,
  overflow: "hidden",
  background: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(148,163,184,0.2)",
};

const cardItemsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  margin: "8px 0",
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(15,23,42,0.5)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const itemRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  gap: 12,
};

const cardFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
  paddingTop: 10,
  borderTop: "1px solid rgba(148,163,184,0.15)",
};

const emptyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 60,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.6)",
};

const shopBtnStyle = {
  marginTop: 12,
  padding: "10px 22px",
  borderRadius: 12,
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#fff",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
  fontSize: 15,
  marginBottom: 12,
  padding: "8px 14px",
  borderRadius: 12,
  background: "rgba(148,163,184,0.07)",
  border: "1px solid rgba(148,163,184,0.12)",
};
