import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import CatalogoClient from "@/components/CatalogoClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categorias, productos, config] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
    prisma.producto.findMany({ orderBy: { creadoEn: "asc" } }),
    getConfig(),
  ]);

  return (
    <CatalogoClient
      categorias={categorias}
      productos={productos}
      nombreNegocio={config.nombreNegocio}
      whatsappNumero={config.whatsappNumero}
    />
  );
}
