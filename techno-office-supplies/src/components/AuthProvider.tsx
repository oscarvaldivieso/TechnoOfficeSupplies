"use client";

import { useEffect } from "react";
import { onAuthChange } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * AuthProvider: se monta una sola vez en el RootLayout.
 * Escucha los cambios de sesión de Firebase y los sincroniza con el store de Zustand.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        // onAuthChange devuelve el unsubscribe para limpiar al desmontar
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, [setUser]);

    return <>{children}</>;
}
