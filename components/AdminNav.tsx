"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/negocio", label: "Negocio" },
  { href: "/admin/enviar-oferta", label: "Enviar oferta" },
  { href: "/admin/perfil", label: "Perfil" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between gap-3 border-b border-base-700/60 px-4 py-3">
      <div className="scrollbar-fina flex gap-1 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-base-800 text-cream"
                : "text-cream/50 hover:text-cream"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex shrink-0 items-center gap-1.5 text-sm text-cream/50 hover:text-cream"
      >
        <LogOut size={15} />
        Salir
      </button>
    </nav>
  );
}
