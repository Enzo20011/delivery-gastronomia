"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import ErrorBanner from "@/components/ErrorBanner";
import { extraerError } from "@/lib/errores";

type Categoria = { id: string; nombre: string; orden: number };

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [conteoProductos, setConteoProductos] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [guardandoNueva, setGuardandoNueva] = useState(false);
  const [error, setError] = useState("");

  async function cargarTodo() {
    setCargando(true);
    const [resCat, resProd] = await Promise.all([
      fetch("/api/categorias"),
      fetch("/api/productos"),
    ]);
    const cats: Categoria[] = await resCat.json();
    const prods: { categoriaId: string }[] = await resProd.json();
    setCategorias(cats);
    const conteo: Record<string, number> = {};
    for (const p of prods) conteo[p.categoriaId] = (conteo[p.categoriaId] ?? 0) + 1;
    setConteoProductos(conteo);
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    setError("");
    setGuardandoNueva(true);
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreNuevo.trim() }),
    });
    setGuardandoNueva(false);
    if (!res.ok) {
      setError(await extraerError(res, "No se pudo crear la categoría."));
      return;
    }
    setNombreNuevo("");
    cargarTodo();
  }

  async function renombrar(cat: Categoria, nombre: string) {
    if (!nombre.trim() || nombre === cat.nombre) return;
    setError("");
    const res = await fetch(`/api/categorias/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim() }),
    });
    if (!res.ok) {
      setError(await extraerError(res, "No se pudo renombrar la categoría."));
      cargarTodo();
      return;
    }
    cargarTodo();
  }

  async function mover(index: number, direccion: -1 | 1) {
    const destino = index + direccion;
    if (destino < 0 || destino >= categorias.length) return;
    setError("");
    const a = categorias[index];
    const b = categorias[destino];
    const res = await Promise.all([
      fetch(`/api/categorias/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: b.orden }),
      }),
      fetch(`/api/categorias/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: a.orden }),
      }),
    ]);
    if (res.some((r) => !r.ok)) {
      setError("No se pudo reordenar. Probá de nuevo.");
    }
    cargarTodo();
  }

  async function eliminar(cat: Categoria) {
    const cantidad = conteoProductos[cat.id] ?? 0;
    const aviso =
      cantidad > 0
        ? `"${cat.nombre}" tiene ${cantidad} producto(s). Si la borrás, se eliminan también. ¿Continuar?`
        : `¿Eliminar la categoría "${cat.nombre}"?`;
    if (!confirm(aviso)) return;

    setError("");
    const res = await fetch(`/api/categorias/${cat.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await extraerError(res, "No se pudo eliminar la categoría."));
      return;
    }
    cargarTodo();
  }

  if (cargando) {
    return <p className="text-sm text-cream/50">Cargando...</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-cream">Categorías</h1>
      <p className="mb-5 text-sm text-cream/50">
        Ordená, renombrá o agregá categorías para el catálogo.
      </p>

      {error && <ErrorBanner mensaje={error} />}

      <form onSubmit={crear} className="mb-5 flex gap-2">
        <input
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="campo-input"
        />
        <button
          type="submit"
          disabled={guardandoNueva || !nombreNuevo.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          <Plus size={16} />
          Agregar
        </button>
      </form>

      <div className="divide-y divide-base-800 rounded-xl border border-base-800">
        {categorias.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-2 p-3">
            <div className="flex flex-col">
              <button
                onClick={() => mover(i, -1)}
                disabled={i === 0}
                aria-label="Subir"
                className="text-cream/40 hover:text-cream disabled:opacity-20"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => mover(i, 1)}
                disabled={i === categorias.length - 1}
                aria-label="Bajar"
                className="text-cream/40 hover:text-cream disabled:opacity-20"
              >
                <ArrowDown size={14} />
              </button>
            </div>
            <input
              defaultValue={cat.nombre}
              onBlur={(e) => renombrar(cat, e.target.value)}
              className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-cream hover:border-base-700 focus:border-accent focus:bg-base-800 focus:outline-none"
            />
            <span className="text-xs text-cream/40">
              {conteoProductos[cat.id] ?? 0} producto(s)
            </span>
            <button
              onClick={() => eliminar(cat)}
              className="text-cream/50 hover:text-red-400"
              aria-label={`Eliminar ${cat.nombre}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {categorias.length === 0 && (
        <p className="mt-4 text-sm text-cream/40">
          No hay categorías todavía. Agregá la primera arriba.
        </p>
      )}
    </div>
  );
}
