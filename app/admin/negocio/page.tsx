"use client";

import { useEffect, useState } from "react";
import ErrorBanner from "@/components/ErrorBanner";
import { extraerError } from "@/lib/errores";

export default function NegocioAdminPage() {
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setNombreNegocio(data.nombreNegocio);
        setWhatsappNumero(data.whatsappNumero);
        setCargando(false);
      });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardado(false);
    setGuardando(true);
    const res = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreNegocio, whatsappNumero }),
    });
    setGuardando(false);
    if (!res.ok) {
      setError(await extraerError(res, "No se pudo guardar la configuración."));
      return;
    }
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando) {
    return <p className="text-sm text-cream/50">Cargando...</p>;
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-1 text-lg font-semibold text-cream">Negocio</h1>
      <p className="mb-5 text-sm text-cream/50">
        Nombre visible en el catálogo y número de WhatsApp donde llegan los pedidos.
      </p>

      {error && <ErrorBanner mensaje={error} />}

      <form onSubmit={guardar} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            Nombre del negocio
          </span>
          <input
            required
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            className="campo-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            WhatsApp (formato internacional, sin +, sin espacios)
          </span>
          <input
            required
            value={whatsappNumero}
            onChange={(e) => setWhatsappNumero(e.target.value)}
            placeholder="5491100000000"
            className="campo-input"
          />
        </label>

        <button
          type="submit"
          disabled={guardando}
          className="mt-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>

        {guardado && <p className="text-center text-sm text-accent-light">Guardado.</p>}
      </form>
    </div>
  );
}
