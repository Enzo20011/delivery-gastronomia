export async function extraerError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
    const campos = data?.error?.fieldErrors;
    if (campos) {
      const primero = Object.values(campos).flat()[0];
      if (typeof primero === "string") return primero;
    }
  } catch {
    // respuesta sin JSON, usamos el mensaje genérico
  }
  return fallback;
}
