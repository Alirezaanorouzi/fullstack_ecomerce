import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ecom_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setItems(JSON.parse(raw) || []);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function add(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((x) => x.productId === product._id);
      if (found) {
        return prev.map((x) =>
          x.productId === product._id ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          qty,
        },
      ];
    });
  }

  function remove(productId) {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }

  function setQty(productId, qty) {
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, qty } : x))
    );
  }

  function clear() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, x) => sum + x.qty * x.price, 0);
    return { itemsPrice };
  }, [items]);

  const value = useMemo(() => ({ items, ...totals, add, remove, setQty, clear }), [items, totals]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

