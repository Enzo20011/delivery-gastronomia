"use client";

import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { armarLinkWhatsapp, formatearPrecio } from "@/lib/whatsapp";

export default function CartDrawer({ whatsappNumero }: { whatsappNumero: string }) {
  const { items, cambiarCantidad, quitar, vaciar, total, abierto, setAbierto } =
    useCart();
  const [nombre, setNombre] = useState("");

  if (!abierto) return null;

  function confirmarPedido() {
    const link = armarLinkWhatsapp(whatsappNumero, items, nombre.trim());
    window.open(link, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Cerrar carrito"
        onClick={() => setAbierto(false)}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-base-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-700/60 p-4">
          <h2 className="text-base font-semibold text-cream">Tu pedido</h2>
          <button
            onClick={() => setAbierto(false)}
            className="text-cream/60 hover:text-cream"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-fina flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-cream/50">
              Todavía no agregaste nada.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cream">{item.nombre}</p>
                    <p className="text-xs text-cream/50">
                      {formatearPrecio(item.precio)} c/u
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-base-800 text-cream/70 hover:bg-base-700"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm text-cream">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-base-800 text-cream/70 hover:bg-base-700"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => quitar(item.id)}
                        className="ml-auto text-cream/40 hover:text-red-400"
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-cream/80">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-base-700/60 p-4">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="mb-3 w-full rounded-lg border border-base-700 bg-base-800 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-accent focus:outline-none"
            />
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-cream/60">Total</span>
              <span className="text-base font-semibold text-cream">
                {formatearPrecio(total)}
              </span>
            </div>
            <button
              onClick={confirmarPedido}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-base-950 transition-colors hover:bg-accent-light"
            >
              Pedir por WhatsApp
            </button>
            <button
              onClick={vaciar}
              className="mt-2 w-full text-center text-xs text-cream/40 hover:text-cream/70"
            >
              Vaciar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
