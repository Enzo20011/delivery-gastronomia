"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DemoBanner() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function reiniciar() {
    setCargando(true);
    await fetch("/api/demo/reset", { method: "POST" });
    setCargando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-700/60 bg-base-800/60 px-4 py-2 text-xs text-cream/70">
      <span>
        Modo demo: probá todo sin contraseña. Tus cambios son solo tuyos y se borran solos a las 2 horas.
      </span>
      <span className="flex items-center gap-3">
        <a href="/" className="underline underline-offset-2 hover:text-cream">
          Ver catálogo
        </a>
        <button
          onClick={reiniciar}
          disabled={cargando}
          className="underline underline-offset-2 hover:text-cream disabled:opacity-50"
        >
          {cargando ? "Restableciendo…" : "Restablecer datos"}
        </button>
      </span>
    </div>
  );
}
