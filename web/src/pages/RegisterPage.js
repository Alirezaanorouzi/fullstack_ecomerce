import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import "./Auth.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (e2) {
      setErr(e2.message || "ثبت‌نام ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <h1>ایجاد حساب کاربری</h1>
      {err ? <div className="err" style={{ marginBottom: 10 }}>{err}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>نام</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>ایمیل</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="authBtn" type="submit" disabled={loading}>
          {loading ? "در حال ایجاد…" : "ایجاد حساب"}
        </button>
      </form>
      <p style={{ marginTop: 12, color: "#b8c3da" }}>
        حساب کاربری دارید؟ <Link to="/login">ورود</Link>
      </p>
    </div>
  );
}
