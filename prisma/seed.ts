import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "cambiar-esta-clave";

  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, nombre: "Admin" },
  });
  console.log(`Admin listo: ${email}`);

  await prisma.config.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nombreNegocio: "Tu negocio gastronómico",
      whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    },
  });

  const entradas = await prisma.categoria.upsert({
    where: { id: "cat-entradas" },
    update: {},
    create: { id: "cat-entradas", nombre: "Entradas", orden: 1 },
  });
  const principales = await prisma.categoria.upsert({
    where: { id: "cat-principales" },
    update: {},
    create: { id: "cat-principales", nombre: "Platos principales", orden: 2 },
  });
  const bebidas = await prisma.categoria.upsert({
    where: { id: "cat-bebidas" },
    update: {},
    create: { id: "cat-bebidas", nombre: "Bebidas", orden: 3 },
  });

  const productos = [
    {
      nombre: "Empanadas de carne (x6)",
      descripcion: "Cortadas a cuchillo, horneadas al momento",
      precio: 5400,
      categoriaId: entradas.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1521732670659-b8c918da61dc?w=800&q=80",
      destacado: true,
    },
    {
      nombre: "Provoleta",
      descripcion: "Con orégano y aceite de oliva",
      precio: 6200,
      categoriaId: entradas.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1598683387046-f31bf43a0dc7?w=800&q=80",
    },
    {
      nombre: "Milanesa napolitana con papas",
      descripcion: "Jamón, muzzarella y salsa casera",
      precio: 12500,
      categoriaId: principales.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80",
      destacado: true,
    },
    {
      nombre: "Bife de chorizo",
      descripcion: "400g, a la parrilla, guarnición a elección",
      precio: 15800,
      categoriaId: principales.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    },
    {
      nombre: "Cerveza artesanal IPA 500ml",
      descripcion: "",
      precio: 4200,
      categoriaId: bebidas.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
    },
    {
      nombre: "Limonada casera",
      descripcion: "Con menta y jengibre",
      precio: 3100,
      categoriaId: bebidas.id,
      imagenUrl:
        "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80",
    },
  ];

  for (const p of productos) {
    const existe = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    if (!existe) await prisma.producto.create({ data: p });
  }

  console.log("Categorías y productos de ejemplo cargados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
