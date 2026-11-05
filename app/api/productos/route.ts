import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { demoScope } from "@/lib/demo";

export async function GET() {
  const demoId = await demoScope();
  const productos = await prisma.producto.findMany({
    where: { demoId },
    orderBy: { creadoEn: "asc" },
    include: { categoria: true },
  });
  return NextResponse.json(productos);
}

const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional().default(""),
  precio: z.number().int().nonnegative(),
  imagenUrl: z.string().optional().default(""),
  disponible: z.boolean().optional().default(true),
  destacado: z.boolean().optional().default(false),
  categoriaId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const demoId = await demoScope();
  const body = await req.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: parsed.data.categoriaId, demoId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "La categoría seleccionada no existe" }, { status: 400 });
  }

  const producto = await prisma.producto.create({ data: { ...parsed.data, demoId } });
  return NextResponse.json(producto, { status: 201 });
}
