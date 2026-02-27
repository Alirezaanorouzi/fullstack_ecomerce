import React from "react";
import ProductCard from "./ProductCard";
import "../pages/products.css";

export default function ProductGrid({ items }) {
  return (
    <div className="grid">
      {items.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
      {items.length === 0 ? <p>محصولی یافت نشد.</p> : null}
    </div>
  );
}
