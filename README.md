# Delivery & Gastronomía — plantilla

Catálogo digital + pedidos por WhatsApp + panel admin + notificaciones push de ofertas.
Pensado como plantilla reusable para rotiserías, cervecerías y locales gastronómicos.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · PostgreSQL + Prisma · NextAuth (credenciales) · Web Push (VAPID)

## Puesta en marcha local

```bash
npm install
cp .env.example .env
```

Completá `.env`:

1. **DATABASE_URL**: una base Postgres (Neon es gratis y ya la conocés de otros proyectos).
2. **NEXTAUTH_SECRET**: `openssl rand -base64 32`
3. **ADMIN_EMAIL / ADMIN_PASSWORD**: el login que vas a usar para entrar a `/admin`.
4. **NEXT_PUBLIC_WHATSAPP_NUMBER**: el número del negocio (54 9 376..., sin +, sin espacios).
5. **VAPID keys** (para las notificaciones push):
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copiá `Public Key` en `VAPID_PUBLIC_KEY` y `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (van igual),
   y `Private Key` en `VAPID_PRIVATE_KEY`.

Migrar la base y cargar datos de ejemplo:

```bash
npx prisma migrate dev --name init
npm run seed
```

Correr en desarrollo:

```bash
npm run dev
```

- Catálogo público: `http://localhost:3000`
- Panel admin: `http://localhost:3000/admin/login`

## Qué incluye

- **`/`** — catálogo público: categorías, destacados, carrito persistente (localStorage) y
  checkout que arma el mensaje de WhatsApp automáticamente (mismo patrón que usan Meniu,
  OlaClick y el catálogo nativo de WhatsApp Business: el pedido se arma en el sitio, se
  cierra en el chat).
- **`/admin/productos`** — alta, edición, baja y toggle "disponible" por producto (para
  sacar de circulación algo que se agotó sin borrarlo).
- **`/admin/enviar-oferta`** — dispara una notificación push a todos los que la activaron.
- **Push notifications** vía Web Push estándar (sin Firebase) — service worker en
  `public/sw.js`, VAPID keys propias.

## Cómo lo reusás para otro cliente

1. Cambiá `nombreNegocio` en `app/page.tsx`.
2. Correé el seed con las categorías/productos reales, o cargalos desde `/admin/productos`.
3. Actualizá `NEXT_PUBLIC_WHATSAPP_NUMBER` con el número del cliente.
4. Ajustá colores en `tailwind.config.ts` (`colors.accent`) si el cliente quiere su propia
   paleta en vez del azul por defecto.

## Deploy

Con lo que ya usaste en otros proyectos alcanza: base en **Neon**, app en **Railway** o
**Vercel**. Variables de entorno iguales a `.env`, y corré `npx prisma migrate deploy`
después del primer deploy.

## Modo demo

Con `DEMO_MODE=1` (y `NEXT_PUBLIC_DEMO_MODE=1` para mostrar el aviso) la app funciona como una demo pública:

- El panel de administración se abre **sin contraseña**.
- Cada visitante recibe **su propio espacio de datos**, identificado por una cookie. Dos personas que editan al mismo tiempo no se ven entre sí.
- Los espacios se crean con datos de ejemplo y se **borran solos a las 2 horas**. También hay un botón para restablecerlos.
- Las notificaciones push se simulan y no se guardan suscripciones.

Sin esas variables, la app se comporta como siempre, con login.
