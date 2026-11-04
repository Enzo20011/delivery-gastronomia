import { prisma } from "@/lib/prisma";

const CONFIG_ID = "singleton";

export async function getConfig() {
  return prisma.config.upsert({
    where: { id: CONFIG_ID },
    update: {},
    create: {
      id: CONFIG_ID,
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    },
  });
}
