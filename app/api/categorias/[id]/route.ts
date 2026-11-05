import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const actualizarSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  orden: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = actualizarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existe = await prisma.categoria.findUnique({ where: { id: params.id } });
  if (!existe) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

  const categoria = await prisma.categoria.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(categoria);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const existe = await prisma.categoria.findUnique({ where: { id: params.id } });
  if (!existe) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

  const totalCategorias = await prisma.categoria.count();
  if (totalCategorias <= 1) {
    return NextResponse.json(
      { error: "Tiene que quedar al menos una categoría" },
      { status: 400 }
    );
  }

  // onDelete: Cascade en el schema borra también los productos de esta categoría.
  await prisma.categoria.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
