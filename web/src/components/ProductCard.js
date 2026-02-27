import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import Modal from "./Modal";

export default function ProductCard({ product, onFavorited }) {
  const { token, isAuthed, isAdmin, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [favorited, setFavorited] = useState(false);

  async function toggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isAdmin) return;
    if (!isAuthed) {
      setModalOpen(true);
      return;
    }
    setBusy(true);
    try {
      const data = await api(`/api/products/${product._id}/favorite`, {
        method: "POST",
        token,
      });
      setFavorited(!!data.favorited);
      onFavorited?.(product._id, !!data.favorited);
    } finally {
      setBusy(false);
    }
  }

  const star = useMemo(() => {
    if (!isAuthed) return "☆";
    return favorited ? "★" : "☆";
  }, [favorited, isAuthed]);

  return (
    <>
      <div className="card">
        <div className="thumb">
          {product.image ? <img src={product.image} alt={product.name} /> : "بدون تصویر"}
        </div>
        <div className="meta">
          <div className="nameRow">
            <div className="name">{product.name}</div>
            <button
              className="starBtn"
                onClick={toggleFavorite}
                disabled={busy || isAdmin}
                title={isAdmin ? "ادمین امکان ستاره دادن ندارد" : "ستاره دادن به محصول"}
            >
              {star}
            </button>
          </div>
          <div className="row">
            <div className="price">${product.price}</div>
            <Link className="btn" to={`/product/${product._id}`}>
              مشاهده
            </Link>
            <button className="btn ghost" onClick={() => setModalOpen(true)}>
              نظرات
            </button>
          </div>
        </div>
      </div>

      <ProductFeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
        token={token}
        isAdmin={isAdmin}
        isAuthed={isAuthed}
        currentUser={user}
      />
    </>
  );
}

function ProductFeedbackModal({ open, onClose, product, token, isAdmin, isAuthed, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [err, setErr] = useState(null);
   const [rating, setRating] = useState(5);
   const [comment, setComment] = useState("");
   const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [rev, fav] = await Promise.all([
        api(`/api/products/${product._id}/reviews`),
        isAdmin && token ? api(`/api/products/${product._id}/favorites`, { token }) : Promise.resolve(null),
      ]);
      setReviews(rev?.items || []);
      setFavorites(fav);
    } catch (e) {
      setErr(e.message || "خطا در بارگذاری نظرات");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    setRating(5);
    setComment("");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal open={open} title={`نظرات • ${product.name}`} onClose={onClose}>
      {loading ? <p>در حال بارگذاری…</p> : null}
      {err ? <p style={{ color: "#fecaca" }}>{err}</p> : null}

      {!isAuthed ? (
        <p style={{ color: "#9ca3af" }}>برای ستاره دادن و ثبت نظر وارد شوید.</p>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <h3 style={{ margin: "4px 0 10px" }}>نظرات</h3>
          {reviews && reviews.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>هنوز نظری ثبت نشده.</p>
          ) : null}
          <div style={{ display: "grid", gap: 10 }}>
            {(reviews || [])
              .filter((r) => {
                if (isAdmin) return true;
                if (!currentUser) return false;
                return r.user && r.user._id === currentUser.id;
              })
              .map((r) => (
              <div
                key={r._id}
                style={{
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>{r.user?.name || "کاربر"}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString("fa-IR")}</div>
                </div>
                <div style={{ color: "#fde68a", fontWeight: 900, marginTop: 4 }}>
                  {"★".repeat(r.rating)}{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 600 }}>
                    {"★".repeat(5 - r.rating).replace(/★/g, "☆")}
                  </span>
                </div>
                {r.comment ? <div style={{ marginTop: 6, color: "#e5e7eb" }}>{r.comment}</div> : null}
              </div>
            ))}
          </div>

          {isAuthed && !isAdmin ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                setSaving(true);
                setErr(null);
                try {
                  await api(`/api/products/${product._id}/reviews`, {
                    method: "POST",
                    token,
                    body: { rating: Number(rating), comment },
                  });
                  setComment("");
                  await load();
                } catch (e2) {
                  setErr(e2.message || "خطا در ذخیره نظر");
                } finally {
                  setSaving(false);
                }
              }}
              style={{ marginTop: 14, display: "grid", gap: 8 }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ color: "#9ca3af", fontSize: 13 }}>امتیاز شما</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.5)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                  }}
                >
                  <option value={5}>★★★★★</option>
                  <option value={4}>★★★★☆</option>
                  <option value={3}>★★★☆☆</option>
                  <option value={2}>★★☆☆☆</option>
                  <option value={1}>★☆☆☆☆</option>
                </select>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="نظر خود را بنویسید…"
                rows={3}
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e5e7eb",
                  padding: 8,
                  resize: "vertical",
                }}
              />
              <button
                type="submit"
                disabled={saving}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "rgba(56,189,248,0.2)",
                  color: "#e0f2fe",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {saving ? "در حال ذخیره…" : "ثبت نظر"}
              </button>
            </form>
          ) : null}
        </div>
        <div>
          <h3 style={{ margin: "4px 0 10px" }}>ستاره‌ها</h3>
          {!isAdmin ? (
            <p style={{ color: "#9ca3af" }}>فقط ادمین می‌تواند لیست ستاره‌دهندگان را ببیند.</p>
          ) : null}
          {isAdmin && favorites ? (
            <>
              <div style={{ color: "#9ca3af", marginBottom: 10 }}>مجموع: {favorites.total}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {(favorites.items || []).map((x) => (
                  <div
                    key={x.id}
                    style={{
                      border: "1px solid rgba(148,163,184,0.25)",
                      borderRadius: 12,
                      padding: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{x.user?.name}</div>
                    <div style={{ color: "#9ca3af" }}>{x.user?.email}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
