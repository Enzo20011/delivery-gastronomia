"use client";

import { useMemo, useState } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import CartButton from "@/components/CartButton";
import PushOptIn from "@/components/PushOptIn";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  disponible: boolean;
  categoriaId: string;
  destacado: boolean;
};

type Categoria = { id: string; nombre: string };

export default function CatalogoClient({
  categorias,
  productos,
  nombreNegocio,
  whatsappNumero,
}: {
  categorias: Categoria[];
  productos: Producto[];
  nombreNegocio: string;
  whatsappNumero: string;
}) {
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0]?.id ?? "");

  const destacados = useMemo(() => productos.filter((p) => p.destacado), [productos]);

  const productosFiltrados = useMemo(
    () => productos.filter((p) => p.categoriaId === categoriaActiva),
    [productos, categoriaActiva]
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-cream/40">
          Menú digital
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-cream">{nombreNegocio}</h1>
      </header>

      {destacados.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 text-sm font-medium text-cream/60">Lo más pedido</h2>
          <div className="scrollbar-fina flex gap-3 overflow-x-auto pb-1">
            {destacados.map((p) => (
              <div key={p.id} className="w-40 shrink-0">
                <ProductCard {...p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <CategoryTabs
            categorias={categorias}
            activa={categoriaActiva}
            onChange={setCategoriaActiva}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {productosFiltrados.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <p className="py-10 text-center text-sm text-cream/40">
            Todavía no hay productos en esta categoría.
          </p>
        )}
      </section>

      <CartButton />
      <CartDrawer whatsappNumero={whatsappNumero} />
      <PushOptIn />
    </main>
  );
}
