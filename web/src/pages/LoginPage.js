import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import "./Auth.css";

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "admin123";
  const [mode, setMode] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      if (mode === "admin" && !data?.user?.isAdmin) {
        logout();
        throw new Error("این حساب کاربری ادمین نیست.");
      }
      navigate(mode === "admin" ? "/" : "/products");
    } catch (e2) {
      setErr(e2.message || "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authTabs" role="tablist" aria-label="نوع ورود">
        <button
          type="button"
          className={`authTab ${mode === "user" ? "authTabActive" : ""}`}
          onClick={() => {
            setMode("user");
            setEmail("");
            setPassword("");
          }}
          aria-selected={mode === "user"}
        >
          کاربر
        </button>
        <button
          type="button"
          className={`authTab ${mode === "admin" ? "authTabActive" : ""}`}
          onClick={() => {
            setMode("admin");
            setEmail(ADMIN_EMAIL);
            setPassword(ADMIN_PASSWORD);
          }}
          aria-selected={mode === "admin"}
        >
          ادمین
        </button>
      </div>

      <h1 style={{ marginTop: 10 }}>ورود</h1>
      {err ? <div className="err" style={{ marginBottom: 10 }}>{err}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>ایمیل</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="authBtn" type="submit" disabled={loading}>
          {loading ? "در حال ورود…" : mode === "admin" ? "ورود به عنوان ادمین" : "ورود"}
        </button>
      </form>
      <p style={{ marginTop: 12, color: "#b8c3da" }}>
        حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
      </p>
    </div>
  );
}
