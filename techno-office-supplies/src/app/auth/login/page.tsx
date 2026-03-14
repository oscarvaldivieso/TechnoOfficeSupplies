"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Package } from "lucide-react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/admin/productos";

    const { login, isLoading, error, user, clearError } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Si ya hay sesión activa, redirigir directamente
    useEffect(() => {
        if (user) router.push(redirect);
    }, [user, router, redirect]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        clearError();
        const ok = await login(email, password);
        if (ok) {
            // Guardamos una cookie simple para que el middleware pueda verificarla
            document.cookie = "session=true; path=/; max-age=86400; SameSite=Lax";
            router.push(redirect);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo/Branding */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
                        <Package className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        TechnoOffice Supplies
                    </h1>
                    <p className="text-sm text-slate-400">Panel de administración</p>
                </div>

                {/* Card de Login */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-white">Iniciar sesión</CardTitle>
                        <CardDescription className="text-slate-400">
                            Ingresa tus credenciales para acceder al catálogo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="border-red-800 bg-red-900/30">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-red-300">
                                        Correo o contraseña incorrectos
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@technooffice.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Ingresando...
                                    </>
                                ) : (
                                    "Ingresar"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
