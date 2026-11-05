import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const categorias = await prisma.categoria.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json(categorias);
}

const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = categoriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ultima = await prisma.categoria.findFirst({ orderBy: { orden: "desc" } });
  const categoria = await prisma.categoria.create({
    data: { nombre: parsed.data.nombre, orden: (ultima?.orden ?? 0) + 1 },
  });
  return NextResponse.json(categoria, { status: 201 });
}
