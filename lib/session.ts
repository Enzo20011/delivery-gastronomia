import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DEMO } from "@/lib/demo";

/** En modo demo el panel de administración queda abierto, sin contraseña. */
export async function getSession() {
  if (DEMO) return { user: { id: "demo", email: "demo@example.com", name: "Demo" } };
  return getServerSession(authOptions);
}
