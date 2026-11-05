import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DEMO } from "@/lib/demo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const total = DEMO ? 0 : await prisma.pushSubscription.count();
  return NextResponse.json({ total });
}
