import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

const configSchema = z.object({
  nombreNegocio: z.string().trim().min(1, "El nombre no puede estar vacío"),
  whatsappNumero: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "Usá el número en formato internacional, solo dígitos (ej: 5491100000000)"),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await getConfig();
  const config = await prisma.config.update({
    where: { id: "singleton" },
    data: parsed.data,
  });
  return NextResponse.json(config);
}
