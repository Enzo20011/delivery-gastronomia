"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushOptIn() {
  const [visible, setVisible] = useState(false);
  const [estado, setEstado] = useState<"idle" | "cargando" | "listo" | "error">(
    "idle"
  );

  useEffect(() => {
    const soportado =
      "serviceWorker" in navigator && "PushManager" in window && VAPID_PUBLIC_KEY;
    const yaDecidido = localStorage.getItem("push-decidido");
    if (soportado && !yaDecidido && Notification.permission === "default") {
      setVisible(true);
    }
  }, []);

  async function activar() {
    setEstado("cargando");
    try {
      const registro = await navigator.serviceWorker.register("/sw.js");
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado("idle");
        cerrar();
        return;
      }

      const subscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscripcion),
      });

      setEstado("listo");
      localStorage.setItem("push-decidido", "1");
      setTimeout(() => setVisible(false), 1800);
    } catch (err) {
      console.error(err);
      setEstado("error");
    }
  }

  function cerrar() {
    localStorage.setItem("push-decidido", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex max-w-xs items-start gap-3 rounded-2xl border border-base-700 bg-base-900 p-4 shadow-xl">
      <Bell size={18} className="mt-0.5 shrink-0 text-accent-light" />
      <div className="flex-1">
        <p className="text-sm font-medium text-cream">
          {estado === "listo" ? "¡Listo! Te vamos a avisar." : "Enterate de las ofertas"}
        </p>
        {estado !== "listo" && (
          <>
            <p className="mt-0.5 text-xs text-cream/55">
              Activá las notificaciones y recibí promos antes que nadie.
            </p>
            <button
              onClick={activar}
              disabled={estado === "cargando"}
              className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-base-950 hover:bg-accent-light disabled:opacity-60"
            >
              {estado === "cargando" ? "Activando..." : "Activar"}
            </button>
          </>
        )}
      </div>
      <button
        onClick={cerrar}
        className="text-cream/40 hover:text-cream/70"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
