import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Modo demo: cada visitante trabaja sobre su propio espacio de datos (identificado por
 * una cookie), sin contraseña, y los espacios viejos se borran solos.
 * Se activa con DEMO_MODE=1. Sin esa variable, la app funciona normal.
 */
export const DEMO = process.env.DEMO_MODE === "1";
export const DEMO_COOKIE = "demo_id";
export const DEMO_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas
const ID_VALIDO = /^[a-z0-9]{12,40}$/;

const CATEGORIAS = ["Entradas", "Platos principales", "Bebidas"];

const PRODUCTOS = [
  { cat: 0, nombre: "Empanadas de carne (x6)", descripcion: "Cortadas a cuchillo, horneadas al momento", precio: 5400, destacado: true, img: "photo-1521732670659-b8c918da61dc" },
  { cat: 0, nombre: "Provoleta", descripcion: "Con orégano y aceite de oliva", precio: 6200, destacado: false, img: "photo-1598683387046-f31bf43a0dc7" },
  { cat: 1, nombre: "Milanesa napolitana con papas", descripcion: "Jamón, muzzarella y salsa casera", precio: 12500, destacado: true, img: "photo-1432139555190-58524dae6a55" },
  { cat: 1, nombre: "Bife de chorizo", descripcion: "400 g, a la parrilla, guarnición a elección", precio: 15800, destacado: false, img: "photo-1544025162-d76694265947" },
  { cat: 2, nombre: "Cerveza artesanal IPA 500 ml", descripcion: "", precio: 4200, destacado: false, img: "photo-1608270586620-248524c67de9" },
  { cat: 2, nombre: "Limonada casera", descripcion: "Con menta y jengibre", precio: 3100, destacado: false, img: "photo-1621263764928-df1444c5e859" },
];

export function currentDemoId(): string {
  if (!DEMO) return "";
  const raw = headers().get("x-demo-id") ?? cookies().get(DEMO_COOKIE)?.value ?? "";
  return ID_VALIDO.test(raw) ? raw : "";
}

export function configIdFor(demoId: string) {
  return demoId ? `demo-${demoId}` : "singleton";
}

/** Devuelve el id del espacio del visitante ("" fuera del modo demo) y lo crea si hace falta. */
export async function demoScope(): Promise<string> {
  if (!DEMO) return "";
  const id = currentDemoId();
  if (!id) throw new Error("Sesión de demo no disponible");
  await asegurarEspacio(id);
  return id;
}

async function asegurarEspacio(id: string) {
  const cfgId = configIdFor(id);
  const existe = await prisma.config.findUnique({ where: { id: cfgId }, select: { id: true } });
  if (existe) return;

  await limpiarVencidos();

  try {
    await prisma.config.create({
      data: { id: cfgId, demoId: id, nombreNegocio: "Mi negocio gastronómico", whatsappNumero: "5491100000000" },
    });
  } catch {
    // Otro pedido del mismo visitante ya está sembrando: esperamos un instante.
    await new Promise((r) => setTimeout(r, 700));
    return;
  }

  await prisma.categoria.createMany({
    data: CATEGORIAS.map((nombre, i) => ({ id: `${id}-c${i}`, nombre, orden: i + 1, demoId: id })),
  });
  const base = Date.now();
  await prisma.producto.createMany({
    data: PRODUCTOS.map((p, i) => ({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      destacado: p.destacado,
      imagenUrl: `https://images.unsplash.com/${p.img}?w=800&q=80`,
      categoriaId: `${id}-c${p.cat}`,
      demoId: id,
      creadoEn: new Date(base + i * 1000),
    })),
  });
}

/** Borra los espacios de demo con más de 2 horas. Se ejecuta al crear un espacio nuevo. */
async function limpiarVencidos() {
  const corte = new Date(Date.now() - DEMO_TTL_MS);
  const viejos = await prisma.config.findMany({
    where: { demoId: { not: "" }, creadoEn: { lt: corte } },
    select: { demoId: true },
  });
  if (!viejos.length) return;
  const ids = viejos.map((v) => v.demoId);
  await prisma.categoria.deleteMany({ where: { demoId: { in: ids } } }); // borra también sus productos
  await prisma.config.deleteMany({ where: { demoId: { in: ids } } });
}

/** Deja el espacio del visitante como nuevo (se vuelve a sembrar en el próximo pedido). */
export async function reiniciarEspacio(id: string) {
  await prisma.categoria.deleteMany({ where: { demoId: id } });
  await prisma.config.deleteMany({ where: { id: configIdFor(id) } });
}
