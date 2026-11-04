export type ItemCarrito = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

export function formatearPrecio(centavos: number) {
  // precio se guarda en pesos enteros (no centavos) para simplificar
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(centavos);
}

/**
 * Arma el link de WhatsApp con el pedido ya redactado, para que el cliente
 * solo tenga que apretar "Enviar". Este es el patrón que usan Meniu, OlaClick
 * y el catálogo nativo de WhatsApp Business: el carrito vive en el sitio,
 * pero el pedido y el pago se cierran en el chat.
 */
export function armarLinkWhatsapp(
  numero: string,
  items: ItemCarrito[],
  nombreCliente?: string
) {
  const lineas = items.map(
    (i) => `• ${i.cantidad}x ${i.nombre} — ${formatearPrecio(i.precio * i.cantidad)}`
  );
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const mensaje = [
    "¡Hola! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total: ${formatearPrecio(total)}`,
    nombreCliente ? `\nA nombre de: ${nombreCliente}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
