import { prisma } from "@/lib/prisma";
import { demoScope, configIdFor } from "@/lib/demo";

export async function getConfig() {
  const demoId = await demoScope();
  const id = configIdFor(demoId);
  return prisma.config.upsert({
    where: { id },
    update: {},
    create: {
      id,
      demoId,
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    },
  });
}
