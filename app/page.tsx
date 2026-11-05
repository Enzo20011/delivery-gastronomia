import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { demoScope } from "@/lib/demo";
import CatalogoClient from "@/components/CatalogoClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demoId = await demoScope();
  const [categorias, productos, config] = await Promise.all([
    prisma.categoria.findMany({ where: { demoId }, orderBy: { orden: "asc" } }),
    prisma.producto.findMany({ where: { demoId }, orderBy: { creadoEn: "asc" } }),
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
