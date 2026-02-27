import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useCart } from "../state/cart";
import "./layout.css";

export default function Layout() {
  const { user, isAuthed, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebarBrand">فروشگاه آنلاین</div>
        <nav className="sidebarNav">
          <NavLink to="/" end className="navItem">
            داشبورد
          </NavLink>
          <NavLink to="/products" className="navItem sub">
            محصولات
          </NavLink>
          <NavLink to="/cart" className="navItem sub">
            🛒 سبد خرید {items.length > 0 && <span className="cartBadge">{items.length}</span>}
          </NavLink>
          {isAuthed && !user?.isAdmin && (
            <NavLink to="/my-orders" className="navItem sub">
              📦 سفارش‌های من
            </NavLink>
          )}
          {user?.isAdmin && (
            <NavLink to="/orders" className="navItem sub">
              سفارشات
            </NavLink>
          )}
        </nav>
        <div className="sidebarBottom">
          {isAuthed ? (
            <button
              className="linkbtn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              خروج ({user?.name || "کاربر"})
            </button>
          ) : (
            <div className="authLinks">
              <NavLink to="/login">ورود</NavLink>
              <NavLink to="/register">ثبت‌نام</NavLink>
            </div>
          )}
        </div>
      </aside>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
