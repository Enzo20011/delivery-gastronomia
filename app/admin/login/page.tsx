"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCargando(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6"
      >
        <h1 className="mb-5 text-lg font-semibold text-cream">Panel de administración</h1>

        <label className="mb-1 block text-xs font-medium text-cream/60">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-base-700 bg-base-800 px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none"
        />

        <label className="mb-1 block text-xs font-medium text-cream/60">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-base-700 bg-base-800 px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none"
        />

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
