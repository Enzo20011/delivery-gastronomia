"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { cantidadTotal, setAbierto } = useCart();

  if (cantidadTotal === 0) return null;

  return (
    <button
      onClick={() => setAbierto(true)}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-base-950 shadow-lg shadow-accent/20 transition-transform hover:scale-105"
    >
      <ShoppingBag size={18} />
      Ver pedido
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-base-950/20 px-1 text-xs">
        {cantidadTotal}
      </span>
    </button>
  );
}
