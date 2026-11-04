import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const productos = await prisma.producto.findMany({
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = productoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const categoria = await prisma.categoria.findUnique({
    where: { id: parsed.data.categoriaId },
  });
  if (!categoria) {
    return NextResponse.json({ error: "La categoría seleccionada no existe" }, { status: 400 });
  }

  const producto = await prisma.producto.create({ data: parsed.data });
  return NextResponse.json(producto, { status: 201 });
}
