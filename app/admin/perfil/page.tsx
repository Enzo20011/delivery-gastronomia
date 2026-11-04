"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import ErrorBanner from "@/components/ErrorBanner";
import { extraerError } from "@/lib/errores";

export default function PerfilAdminPage() {
  const { data: sesion } = useSession();
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardado(false);

    if (passwordNueva !== passwordConfirmar) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setGuardando(true);
    const res = await fetch("/api/admin/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    setGuardando(false);

    if (!res.ok) {
      setError(await extraerError(res, "No se pudo cambiar la contraseña."));
      return;
    }

    setPasswordActual("");
    setPasswordNueva("");
    setPasswordConfirmar("");
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-1 text-lg font-semibold text-cream">Perfil</h1>
      <p className="mb-5 text-sm text-cream/50">{sesion?.user?.email}</p>

      {error && <ErrorBanner mensaje={error} />}

      <form onSubmit={guardar} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            Contraseña actual
          </span>
          <input
            type="password"
            required
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="campo-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            Contraseña nueva
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="campo-input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-cream/60">
            Confirmar contraseña nueva
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={passwordConfirmar}
            onChange={(e) => setPasswordConfirmar(e.target.value)}
            className="campo-input"
          />
        </label>

        <button
          type="submit"
          disabled={guardando}
          className="mt-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Cambiar contraseña"}
        </button>

        {guardado && (
          <p className="text-center text-sm text-accent-light">Contraseña actualizada.</p>
        )}
      </form>
    </div>
  );
}
