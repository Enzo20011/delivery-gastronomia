import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { webpush } from "@/lib/push";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { titulo, cuerpo, url } = await req.json();
  if (!titulo) return NextResponse.json({ error: "Falta el título" }, { status: 400 });

  const suscripciones = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ titulo, cuerpo, url: url || "/" });

  const resultados = await Promise.allSettled(
    suscripciones.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  // Si el endpoint ya no existe (410/404), lo borramos para no reintentar en vano.
  const vencidas = suscripciones.filter((s, i) => {
    const r = resultados[i];
    return (
      r.status === "rejected" &&
      [404, 410].includes((r.reason as any)?.statusCode)
    );
  });
  if (vencidas.length) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: vencidas.map((s) => s.id) } },
    });
  }

  const enviadas = resultados.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ enviadas, total: suscripciones.length });
}
