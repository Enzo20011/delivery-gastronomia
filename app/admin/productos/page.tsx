"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Search } from "lucide-react";
import { formatearPrecio } from "@/lib/whatsapp";
import ErrorBanner from "@/components/ErrorBanner";
import { extraerError } from "@/lib/errores";

type Categoria = { id: string; nombre: string };
type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  disponible: boolean;
  destacado: boolean;
  categoriaId: string;
};

const vacio = {
  id: "",
  nombre: "",
  descripcion: "",
  precio: 0,
  imagenUrl: "",
  disponible: true,
  destacado: false,
  categoriaId: "",
};

export default function ProductosAdminPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [errorLista, setErrorLista] = useState("");
  const [busqueda, setBusqueda] = useState("");

  async function cargarTodo() {
    setCargando(true);
    const [resCat, resProd] = await Promise.all([
      fetch("/api/categorias"),
      fetch("/api/productos"),
    ]);
    setCategorias(await resCat.json());
    setProductos(await resProd.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function abrirNuevo() {
    setErrorForm("");
    setEditando({ ...vacio, categoriaId: categorias[0]?.id ?? "" });
    setFormAbierto(true);
  }

  function abrirEditar(p: Producto) {
    setErrorForm("");
    setEditando(p);
    setFormAbierto(true);
  }

  async function guardar(datos: Producto) {
    const esNuevo = !datos.id;
    const url = esNuevo ? "/api/productos" : `/api/productos/${datos.id}`;
    const method = esNuevo ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: Number(datos.precio),
        imagenUrl: datos.imagenUrl,
        disponible: datos.disponible,
        destacado: datos.destacado,
        categoriaId: datos.categoriaId,
      }),
    });

    if (!res.ok) {
      setErrorForm(await extraerError(res, "No se pudo guardar el producto."));
      return;
    }

    setFormAbierto(false);
    setEditando(null);
    cargarTodo();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    setErrorLista("");
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setErrorLista(await extraerError(res, "No se pudo eliminar el producto."));
      return;
    }
    cargarTodo();
  }

  async function toggleDisponible(p: Producto) {
    setErrorLista("");
    const res = await fetch(`/api/productos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !p.disponible }),
    });
    if (!res.ok) {
      setErrorLista(await extraerError(res, "No se pudo actualizar el producto."));
      return;
    }
    cargarTodo();
  }

  if (cargando) {
    return <p className="text-sm text-cream/50">Cargando...</p>;
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-cream">Productos</h1>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-base-950 hover:bg-accent-light"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {errorLista && <ErrorBanner mensaje={errorLista} />}

      {productos.length > 0 && (
        <div className="relative mb-5">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/40"
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="campo-input pl-9"
          />
        </div>
      )}

      {categorias.map((cat) => {
        const items = productos.filter(
          (p) =>
            p.categoriaId === cat.id &&
            p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
        );
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-cream/60">{cat.nombre}</h2>
            <div className="divide-y divide-base-800 rounded-xl border border-base-800">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-base-800">
                    {p.imagenUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagenUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cream">{p.nombre}</p>
                    <p className="text-xs text-cream/50">{formatearPrecio(p.precio)}</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-cream/50">
                    <input
                      type="checkbox"
                      checked={p.disponible}
                      onChange={() => toggleDisponible(p)}
                    />
                    Disponible
                  </label>
                  <button onClick={() => abrirEditar(p)} className="text-cream/50 hover:text-cream">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => eliminar(p.id)} className="text-cream/50 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {productos.length === 0 && (
        <p className="text-sm text-cream/40">
          No hay productos todavía. Creá el primero con "Nuevo producto".
        </p>
      )}

      {productos.length > 0 &&
        busqueda.trim() !== "" &&
        !productos.some((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) && (
          <p className="text-sm text-cream/40">
            Ningún producto coincide con "{busqueda}".
          </p>
        )}

      {formAbierto && editando && (
        <FormularioProducto
          producto={editando}
          categorias={categorias}
          error={errorForm}
          onCerrar={() => setFormAbierto(false)}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}

function FormularioProducto({
  producto,
  categorias,
  error,
  onCerrar,
  onGuardar,
}: {
  producto: Producto;
  categorias: Categoria[];
  error: string;
  onCerrar: () => void;
  onGuardar: (p: Producto) => void;
}) {
  const [datos, setDatos] = useState(producto);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGuardar(datos);
        }}
        className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-cream">
            {producto.id ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button type="button" onClick={onCerrar} className="text-cream/50 hover:text-cream">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Campo label="Nombre">
            <input
              required
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              className="campo-input"
            />
          </Campo>

          <Campo label="Descripción">
            <textarea
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
              className="campo-input resize-none"
              rows={2}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Precio (ARS)">
              <input
                type="number"
                min={0}
                required
                value={datos.precio}
                onChange={(e) => setDatos({ ...datos, precio: Number(e.target.value) })}
                className="campo-input"
              />
            </Campo>
            <Campo label="Categoría">
              <select
                value={datos.categoriaId}
                onChange={(e) => setDatos({ ...datos, categoriaId: e.target.value })}
                className="campo-input"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo label="URL de imagen">
            <input
              value={datos.imagenUrl}
              onChange={(e) => setDatos({ ...datos, imagenUrl: e.target.value })}
              className="campo-input"
              placeholder="https://..."
            />
          </Campo>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-cream/70">
              <input
                type="checkbox"
                checked={datos.disponible}
                onChange={(e) => setDatos({ ...datos, disponible: e.target.checked })}
              />
              Disponible
            </label>
            <label className="flex items-center gap-2 text-sm text-cream/70">
              <input
                type="checkbox"
                checked={datos.destacado}
                onChange={(e) => setDatos({ ...datos, destacado: e.target.checked })}
              />
              Destacado
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={categorias.length === 0}
          className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          {categorias.length === 0 ? "Creá una categoría primero" : "Guardar"}
        </button>
      </form>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-cream/60">{label}</span>
      {children}
    </label>
  );
}
