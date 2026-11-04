"use client";

import { useEffect, useState } from "react";

export default function EnviarOfertaPage() {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [suscriptores, setSuscriptores] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/push/suscriptores")
      .then((r) => r.json())
      .then((data) => setSuscriptores(data.total ?? 0))
      .catch(() => setSuscriptores(null));
  }, [resultado]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);

    const res = await fetch("/api/push/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, cuerpo, url: "/" }),
    });
    const data = await res.json();

    setEnviando(false);
    if (res.ok) {
      setResultado(`Enviado a ${data.enviadas} de ${data.total} suscriptores.`);
      setTitulo("");
      setCuerpo("");
    } else {
      setResultado("Hubo un error al enviar la notificación.");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-1 text-lg font-semibold text-cream">Enviar oferta</h1>
      <p className="mb-5 text-sm text-cream/50">
        {suscriptores === null
          ? "Se envía como notificación push a todos los que la activaron en el sitio."
          : suscriptores === 0
            ? "Todavía nadie activó las notificaciones en el sitio."
            : `Se va a enviar a ${suscriptores} suscriptor${suscriptores === 1 ? "" : "es"}.`}
      </p>

      <form onSubmit={enviar} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">Título</span>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="2x1 en empanadas hoy"
            className="campo-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            Mensaje (opcional)
          </span>
          <textarea
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            rows={3}
            className="campo-input resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={enviando || suscriptores === 0}
          className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar notificación"}
        </button>

        {resultado && <p className="text-sm text-cream/60">{resultado}</p>}
      </form>
    </div>
  );
}
