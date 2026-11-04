export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/admin",
    "/admin/productos/:path*",
    "/admin/categorias/:path*",
    "/admin/negocio/:path*",
    "/admin/perfil/:path*",
    "/admin/enviar-oferta/:path*",
  ],
};
