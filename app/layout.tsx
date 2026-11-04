import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Menú Digital",
  description: "Catálogo digital con pedidos por WhatsApp",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0f12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
