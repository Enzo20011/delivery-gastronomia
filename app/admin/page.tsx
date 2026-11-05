import Link from "next/link";
import { Package, Layers, Bell, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DEMO, demoScope } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const demoId = await demoScope();
  const [totalProductos, disponibles, totalCategorias, totalSuscriptores] = await Promise.all([
    prisma.producto.count({ where: { demoId } }),
    prisma.producto.count({ where: { demoId, disponible: true } }),
    prisma.categoria.count({ where: { demoId } }),
    DEMO ? Promise.resolve(0) : prisma.pushSubscription.count(),
  ]);

  const tarjetas = [
    {
      label: "Productos",
      valor: totalProductos,
      sub: `${disponibles} disponible${disponibles === 1 ? "" : "s"}`,
      href: "/admin/productos",
      icon: Package,
    },
    {
      label: "Categorías",
      valor: totalCategorias,
      sub: "en el catálogo",
      href: "/admin/categorias",
      icon: Layers,
    },
    {
      label: "Suscriptores push",
      valor: totalSuscriptores,
      sub: "activados",
      href: "/admin/enviar-oferta",
      icon: Bell,
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-cream">Panel</h1>
      <p className="mb-5 text-sm text-cream/50">Resumen rápido de tu catálogo.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-xl border border-base-800 bg-base-900 p-4 transition-colors hover:border-base-700"
          >
            <div className="mb-3 flex items-center justify-between">
              <t.icon size={18} className="text-accent-light" />
              <ArrowRight
                size={14}
                className="text-cream/30 transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <p className="text-2xl font-semibold text-cream">{t.valor}</p>
            <p className="text-xs text-cream/50">
              {t.label} · {t.sub}
            </p>
          </Link>
        ))}
      </div>

      {totalProductos === 0 && (
        <p className="mt-6 text-sm text-cream/40">
          Todavía no cargaste productos.{" "}
          <Link href="/admin/productos" className="text-accent-light hover:underline">
            Empezá acá
          </Link>
          .
        </p>
      )}
    </div>
  );
}
