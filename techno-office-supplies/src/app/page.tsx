import { redirect } from "next/navigation";

// La raíz siempre redirige al catálogo de productos.
// El middleware redirigirá al login si no hay sesión activa.
export default function RootPage() {
  redirect("/admin/productos");
}
