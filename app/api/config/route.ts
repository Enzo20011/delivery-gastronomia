import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { demoScope, configIdFor } from "@/lib/demo";
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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await getConfig();
  const demoId = await demoScope();
  const config = await prisma.config.update({
    where: { id: configIdFor(demoId) },
    data: parsed.data,
  });
  return NextResponse.json(config);
}
