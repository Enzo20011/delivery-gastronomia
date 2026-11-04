"use client";

type Categoria = { id: string; nombre: string };

type Props = {
  categorias: Categoria[];
  activa: string;
  onChange: (id: string) => void;
};

export default function CategoryTabs({ categorias, activa, onChange }: Props) {
  return (
    <div className="scrollbar-fina flex gap-2 overflow-x-auto pb-1">
      {categorias.map((cat) => {
        const esActiva = cat.id === activa;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              esActiva
                ? "bg-accent text-base-950"
                : "bg-base-800 text-cream/70 hover:bg-base-700"
            }`}
          >
            {cat.nombre}
          </button>
        );
      })}
    </div>
  );
}
