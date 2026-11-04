import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const sub = await req.json();

  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {},
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}
