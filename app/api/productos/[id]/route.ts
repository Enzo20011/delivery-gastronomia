import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const actualizarSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  precio: z.number().int().nonnegative().optional(),
  imagenUrl: z.string().optional(),
  disponible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  categoriaId: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = actualizarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.categoriaId) {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parsed.data.categoriaId },
    });
    if (!categoria) {
      return NextResponse.json({ error: "La categoría seleccionada no existe" }, { status: 400 });
    }
  }

  const existe = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!existe) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const producto = await prisma.producto.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(producto);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const existe = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!existe) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  await prisma.producto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
