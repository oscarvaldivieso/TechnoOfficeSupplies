"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import {
    LayoutGrid,
    Tag,
    Layers,
    Settings,
    LogOut,
    Package2,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
    { href: "/admin/productos", label: "Productos", icon: LayoutGrid },
    { href: "/admin/marcas", label: "Marcas", icon: Tag },
    { href: "/admin/categorias", label: "Categorías", icon: Layers },
    { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Si no hay user (sesión expirada), redirigir al login
    useEffect(() => {
        // Esperar un tick para que el AuthProvider inicialice
        const timeout = setTimeout(() => {
            if (user === null) {
                router.push("/auth/login");
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [user, router]);

    async function handleLogout() {
        await logout();
        document.cookie = "session=; path=/; max-age=0";
        toast.success("Sesión cerrada correctamente");
        router.push("/auth/login");
    }

    const userInitials = user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : "AD";

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside
                className={cn(
                    "flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300",
                    sidebarOpen ? "w-60" : "w-16"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-4 border-b border-slate-800">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                        <Package2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {sidebarOpen && (
                        <span className="font-semibold text-sm leading-tight">
                            TechnoOffice<br />
                            <span className="text-slate-400 font-normal">Supplies</span>
                        </span>
                    )}
                </div>

                {/* Nav items */}
                <nav className="flex-1 space-y-1 p-2 pt-4">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === href || pathname.startsWith(href + "/")
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>{label}</span>}
                        </Link>
                    ))}
                </nav>

                <Separator className="bg-slate-800" />

                {/* User + logout */}
                <div className="p-3 space-y-1">
                    <div className={cn("flex items-center gap-3 px-2 py-2", !sidebarOpen && "justify-center")}>
                        <Avatar className="h-8 w-8 shrink-0 bg-slate-700">
                            <AvatarFallback className="text-xs bg-slate-700 text-slate-300">{userInitials}</AvatarFallback>
                        </Avatar>
                        {sidebarOpen && (
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className={cn(
                            "w-full text-slate-400 hover:text-red-400 hover:bg-red-900/20",
                            sidebarOpen ? "justify-start gap-2" : "justify-center px-0"
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {sidebarOpen && "Cerrar sesión"}
                    </Button>
                </div>
            </aside>

            {/* ── Main content ──────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Topbar */}
                <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
                    <button
                        onClick={() => setSidebarOpen((o) => !o)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="hidden sm:block">Panel de Administración</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6 bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
