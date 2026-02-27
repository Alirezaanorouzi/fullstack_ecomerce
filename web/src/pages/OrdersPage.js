import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";

export default function OrdersPage() {
  const { token, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const path = isAdmin ? "/api/orders" : "/api/orders/mine";
        const data = await api(path, { token });
        if (alive) setItems(data.items || []);
      } catch (e) {
        if (alive) setErr(e.message || "خطا در بارگذاری سفارشات");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{isAdmin ? "مدیریت سفارشات" : "سفارش‌های من"}</h1>
      {loading ? <p>در حال بارگذاری…</p> : null}
      {err ? <p style={{ color: "#fecaca" }}>{err}</p> : null}
      <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
        {items.map((o) => (
          <OrderCard key={o._id} order={o} isAdmin={isAdmin} />
        ))}
        {!loading && items.length === 0 ? <p>سفارشی ثبت نشده است.</p> : null}
      </div>
    </div>
  );
}

function OrderCard({ order, isAdmin }) {
  const firstItem = order.orderItems?.[0];
  const itemsCount =
    order.orderItems?.reduce((sum, it) => sum + (it.qty || 0), 0) ?? 0;

  let deliveryLabel;
  if (order.isDelivered && order.deliveredAt) {
    deliveryLabel = `تحویل داده شده در ${new Date(order.deliveredAt).toLocaleDateString("fa-IR")}`;
  } else {
    const created = new Date(order.createdAt);
    const eta = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
    deliveryLabel = `تحویل تخمینی: ${eta.toLocaleDateString("fa-IR")}`;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr auto",
        gap: 12,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.4)",
        fontSize: 14,
        background: "rgba(15,23,42,0.9)",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 12,
          overflow: "hidden",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        {firstItem?.image ? (
          <img
            src={firstItem.image}
            alt={firstItem.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "بدون تصویر"
        )}
      </div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>
          سفارش #{order._id.slice(-6)} • {itemsCount} آیتم
        </div>
        <div style={{ color: "#9ca3af", marginBottom: 4 }}>
          {firstItem?.name}
          {order.orderItems && order.orderItems.length > 1
            ? ` + ${order.orderItems.length - 1} مورد دیگر`
            : ""}
        </div>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>{deliveryLabel}</div>
      </div>
      <div style={{ textAlign: "left" }}>
        {isAdmin && order.user ? (
          <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>
            {order.user.name} • {order.user.email}
          </div>
        ) : null}
        <div style={{ fontWeight: 800, fontSize: 18 }}>${order.totalPrice}</div>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>
          {order.isPaid ? "پرداخت شده" : "پرداخت نشده"} •{" "}
          {order.isDelivered ? "تحویل شده" : "در انتظار"}
        </div>
      </div>
    </div>
  );
}
