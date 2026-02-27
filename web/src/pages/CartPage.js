import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../state/cart";
import { useAuth } from "../state/auth";

export default function CartPage() {
  const { items, itemsPrice, remove, setQty } = useCart();
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const shippingPrice = itemsPrice >= 100 ? 0 : 10;
  const totalPrice = itemsPrice + shippingPrice;

  function handlePay() {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    navigate("/payment");
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>سبد خرید</h1>
      {items.length === 0 ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <p style={{ color: "#9ca3af", marginTop: 10 }}>سبد خرید شما خالی است.</p>
          <Link to="/products" style={shopBtnStyle}>مشاهده محصولات</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((x) => (
              <div key={x.productId} style={itemCardStyle}>
                <img
                  src={x.image}
                  alt={x.name}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", background: "#111827" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{x.name}</div>
                  <div style={{ color: "#60a5fa", fontWeight: 700 }}>${x.price.toFixed(2)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => setQty(x.productId, Math.max(1, x.qty - 1))} style={qtyBtnStyle}>−</button>
                    <span style={{ width: 32, textAlign: "center", fontWeight: 800 }}>{x.qty}</span>
                    <button onClick={() => setQty(x.productId, x.qty + 1)} style={qtyBtnStyle}>+</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#9ca3af" }}>${(x.price * x.qty).toFixed(2)}</div>
                </div>
                <button onClick={() => remove(x.productId)} style={removeBtnStyle} title="حذف">✕</button>
              </div>
            ))}
          </div>

          <div style={summaryCardStyle}>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 14 }}>خلاصه سفارش</div>
            <div style={summaryRowStyle}>
              <span style={{ color: "#9ca3af" }}>اقلام ({items.reduce((s, x) => s + x.qty, 0)})</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={{ color: "#9ca3af" }}>هزینه ارسال</span>
              <span>{shippingPrice === 0 ? "رایگان" : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div style={{ ...summaryRowStyle, borderTop: "1px solid rgba(148,163,184,0.3)", paddingTop: 10, marginTop: 6 }}>
              <span style={{ fontWeight: 900 }}>مجموع</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: "#34d399" }}>${totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={handlePay} style={payBtnStyle}>
              💳 پرداخت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  background: "#3b82f6",
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
};

const itemCardStyle = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(15,23,42,0.7)",
};

const qtyBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.8)",
  color: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const removeBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.3)",
  background: "rgba(239,68,68,0.1)",
  color: "#f87171",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
};

const summaryCardStyle = {
  padding: 20,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.8)",
  position: "sticky",
  top: 20,
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
  fontSize: 14,
};

const payBtnStyle = {
  width: "100%",
  marginTop: 16,
  padding: "14px 0",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  letterSpacing: 0.3,
};
