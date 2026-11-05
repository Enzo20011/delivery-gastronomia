import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DEMO } from "@/lib/demo";

const schema = z.object({
  passwordActual: z.string().min(1, "Ingresá tu contraseña actual"),
  passwordNueva: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (DEMO) return NextResponse.json({ ok: true }); // en la demo no hay contraseña
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const valido = await bcrypt.compare(parsed.data.passwordActual, admin.password);
  if (!valido) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.passwordNueva, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { password: hash } });

  return NextResponse.json({ ok: true });
}
