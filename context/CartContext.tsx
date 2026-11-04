"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ItemCarrito = {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  cantidad: number;
};

type CartContextType = {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">) => void;
  quitar: (id: string) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  vaciar: () => void;
  total: number;
  cantidadTotal: number;
  abierto: boolean;
  setAbierto: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "carrito-delivery";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        setItems(JSON.parse(guardado));
      } catch {
        // ignorar carrito corrupto
      }
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hidratado]);

  function agregar(item: Omit<ItemCarrito, "cantidad">) {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === item.id);
      if (existe) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
    setAbierto(true);
  }

  function quitar(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function cambiarCantidad(id: string, cantidad: number) {
    if (cantidad <= 0) return quitar(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)));
  }

  function vaciar() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );
  const cantidadTotal = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        agregar,
        quitar,
        cambiarCantidad,
        vaciar,
        total,
        cantidadTotal,
        abierto,
        setAbierto,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
