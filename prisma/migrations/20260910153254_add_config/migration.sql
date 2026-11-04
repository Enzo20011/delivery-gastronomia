-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'Tu negocio gastronómico',
    "whatsappNumero" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
