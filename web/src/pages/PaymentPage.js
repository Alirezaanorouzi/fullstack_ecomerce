import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/cart";
import { useAuth } from "../state/auth";
import { api } from "../lib/api";

const GATEWAYS = [
  {
    id: "zarinpal",
    name: "زرین‌پال",
    nameEn: "ZarinPal",
    color: "#fbbf24",
    bg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    icon: "💳",
    desc: "پرداخت امن با زرین‌پال",
  },
  {
    id: "zibal",
    name: "زیبال",
    nameEn: "Zibal",
    color: "#38bdf8",
    bg: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    icon: "🏦",
    desc: "پرداخت سریع با زیبال",
  },
];

export default function PaymentPage() {
  const { items, itemsPrice, clear } = useCart();
  const { token, isAuthed } = useAuth();
  const navigate = useNavigate();

  const [gateway, setGateway] = useState(null);
  const [step, setStep] = useState("select");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const shippingPrice = itemsPrice >= 100 ? 0 : 10;
  const totalPrice = itemsPrice + shippingPrice;

  if (!isAuthed) {
    navigate("/login");
    return null;
  }

  if (items.length === 0 && step !== "success") {
    navigate("/cart");
    return null;
  }

  function formatCardNumber(val) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  async function handlePay() {
    if (!cardNumber || !expiry || !cvv) return;
    setProcessing(true);
    try {
      const shippingAddress = {
        fullName: "Customer",
        address1: "Address",
        city: "City",
        postalCode: "0000",
        country: "Iran",
      };
      const orderItems = items.map((x) => ({ product: x.productId, qty: x.qty }));
      const order = await api("/api/orders", {
        method: "POST",
        body: { orderItems, shippingAddress, paymentMethod: gateway },
        token,
      });
      await api(`/api/orders/${order._id}/pay`, {
        method: "PUT",
        token,
      });
      clear();
      setStep("success");
    } catch (e) {
      alert(e.message || "پرداخت ناموفق بود");
    } finally {
      setProcessing(false);
    }
  }

  if (step === "success") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={successCardStyle}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 6 }}>پرداخت موفق!</div>
          <div style={{ color: "#9ca3af", marginBottom: 20 }}>سفارش شما با موفقیت ثبت شد</div>
          <div style={{ color: "#34d399", fontWeight: 800, fontSize: 18, marginBottom: 20 }}>${totalPrice.toFixed(2)}</div>
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20 }}>
            درگاه: {GATEWAYS.find((g) => g.id === gateway)?.name}
          </div>
          <button onClick={() => navigate("/my-orders")} style={backBtnStyle}>
            مشاهده سفارش‌های من
          </button>
          <button onClick={() => navigate("/")} style={{ ...changeBtnStyle, marginTop: 10 }}>
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  if (step === "card") {
    const gw = GATEWAYS.find((g) => g.id === gateway);
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={paymentFormCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 28 }}>{gw.icon}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>{gw.name}</div>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>{gw.nameEn}</div>
            </div>
            <div style={{ marginInlineStart: "auto", fontWeight: 900, fontSize: 20, color: "#34d399" }}>${totalPrice.toFixed(2)}</div>
          </div>

          <div style={virtualCardStyle(gw.bg)}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontWeight: 800, fontSize: 14, opacity: 0.9 }}>{gw.nameEn}</span>
              <span style={{ fontSize: 20 }}>{gw.icon}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 3, marginBottom: 16, direction: "ltr", textAlign: "center" }}>
              {cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.85, direction: "ltr" }}>
              <span>{expiry || "MM/YY"}</span>
              <span>{cvv ? "•••" : "CVV"}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <label style={labelStyle}>
              شماره کارت
              <input
                type="text"
                placeholder="۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                style={inputStyle}
                maxLength={19}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={labelStyle}>
                تاریخ انقضا
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  style={inputStyle}
                  maxLength={5}
                />
              </label>
              <label style={labelStyle}>
                رمز پشت کارت
                <input
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  style={inputStyle}
                  maxLength={4}
                />
              </label>
            </div>
          </div>

          <button onClick={handlePay} disabled={processing || !cardNumber || !expiry || !cvv} style={{ ...confirmPayBtnStyle, background: gw.bg, opacity: (!cardNumber || !expiry || !cvv) ? 0.5 : 1 }}>
            {processing ? "در حال پردازش…" : `پرداخت $${totalPrice.toFixed(2)}`}
          </button>

          <button onClick={() => { setStep("select"); setGateway(null); setCardNumber(""); setExpiry(""); setCvv(""); }} style={changeBtnStyle}>
            ← تغییر درگاه پرداخت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={selectContainerStyle}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>انتخاب درگاه پرداخت</div>
          <div style={{ color: "#9ca3af", fontSize: 14 }}>لطفاً یک درگاه انتخاب کنید</div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, padding: "10px 14px", borderRadius: 12, background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.15)" }}>
          <span style={{ color: "#9ca3af" }}>مبلغ قابل پرداخت:</span>
          <span style={{ fontWeight: 900, color: "#34d399" }}>${totalPrice.toFixed(2)}</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {GATEWAYS.map((gw) => (
            <button
              key={gw.id}
              onClick={() => { setGateway(gw.id); setStep("card"); }}
              style={gatewayBtnStyle(gw)}
            >
              <div style={{ fontSize: 32 }}>{gw.icon}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17 }}>{gw.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{gw.desc}</div>
              </div>
              <div style={{ marginInlineStart: "auto", fontWeight: 800, opacity: 0.8 }}>←</div>
            </button>
          ))}
        </div>

        <button onClick={() => navigate("/cart")} style={changeBtnStyle}>
          → بازگشت به سبد خرید
        </button>
      </div>
    </div>
  );
}

const selectContainerStyle = {
  width: "100%",
  maxWidth: 420,
  padding: 28,
  borderRadius: 22,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.9)",
};

function gatewayBtnStyle(gw) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "18px 20px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(15,23,42,0.6)",
    color: "#e5e7eb",
    cursor: "pointer",
    transition: "border 0.15s, background 0.15s",
    textAlign: "right",
  };
}

const paymentFormCardStyle = {
  width: "100%",
  maxWidth: 420,
  padding: 28,
  borderRadius: 22,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.9)",
};

function virtualCardStyle(bg) {
  return {
    padding: "22px 24px",
    borderRadius: 16,
    background: bg,
    color: "#fff",
    minHeight: 140,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
  color: "#9ca3af",
  fontWeight: 700,
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(15,23,42,0.8)",
  color: "#e5e7eb",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 1,
  outline: "none",
  direction: "ltr",
  textAlign: "left",
};

const confirmPayBtnStyle = {
  width: "100%",
  marginTop: 20,
  padding: "14px 0",
  borderRadius: 14,
  border: "none",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  letterSpacing: 0.3,
};

const changeBtnStyle = {
  width: "100%",
  marginTop: 12,
  padding: "10px 0",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "transparent",
  color: "#9ca3af",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const successCardStyle = {
  width: "100%",
  maxWidth: 400,
  textAlign: "center",
  padding: 36,
  borderRadius: 22,
  border: "1px solid rgba(52,211,153,0.3)",
  background: "rgba(15,23,42,0.9)",
};

const backBtnStyle = {
  padding: "12px 28px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 15,
  cursor: "pointer",
};
