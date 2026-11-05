import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { demoScope } from "@/lib/demo";

export async function GET() {
  const demoId = await demoScope();
  const categorias = await prisma.categoria.findMany({ where: { demoId }, orderBy: { orden: "asc" } });
  return NextResponse.json(categorias);
}

const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const demoId = await demoScope();
  const body = await req.json();
  const parsed = categoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ultima = await prisma.categoria.findFirst({ where: { demoId }, orderBy: { orden: "desc" } });
  const categoria = await prisma.categoria.create({
    data: { nombre: parsed.data.nombre, orden: (ultima?.orden ?? 0) + 1, demoId },
  });
  return NextResponse.json(categoria, { status: 201 });
}
