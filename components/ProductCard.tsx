"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatearPrecio } from "@/lib/whatsapp";

type Props = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  disponible: boolean;
};

export default function ProductCard({
  id,
  nombre,
  descripcion,
  precio,
  imagenUrl,
  disponible,
}: Props) {
  const { agregar } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-base-900 border border-base-700/60">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-base-800">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className={`object-cover transition-transform duration-300 ${
              disponible ? "group-hover:scale-105" : "grayscale opacity-50"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-600 text-sm">
            Sin foto
          </div>
        )}
        {!disponible && (
          <span className="absolute top-2 left-2 rounded-full bg-base-950/90 px-2.5 py-1 text-xs font-medium text-cream/70">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="text-sm font-semibold text-cream leading-snug">{nombre}</h3>
        {descripcion && (
          <p className="text-xs text-cream/55 leading-relaxed line-clamp-2">
            {descripcion}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-accent-light">
            {formatearPrecio(precio)}
          </span>
          <button
            disabled={!disponible}
            onClick={() => agregar({ id, nombre, precio, imagenUrl })}
            aria-label={`Agregar ${nombre} al pedido`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base-950 transition-colors hover:bg-accent-light disabled:bg-base-700 disabled:text-base-600"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
