import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { demoScope } from "@/lib/demo";

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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const demoId = await demoScope();
  const body = await req.json();
  const parsed = actualizarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.categoriaId) {
    const categoria = await prisma.categoria.findFirst({
      where: { id: parsed.data.categoriaId, demoId },
    });
    if (!categoria) {
      return NextResponse.json({ error: "La categoría seleccionada no existe" }, { status: 400 });
    }
  }

  const existe = await prisma.producto.findFirst({ where: { id: params.id, demoId } });
  if (!existe) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const producto = await prisma.producto.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(producto);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const demoId = await demoScope();

  const existe = await prisma.producto.findFirst({ where: { id: params.id, demoId } });
  if (!existe) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  await prisma.producto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
