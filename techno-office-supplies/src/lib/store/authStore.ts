import { create } from "zustand";
import type { User } from "firebase/auth";
import { signIn, signOutUser } from "@/lib/firebase/auth";

interface AuthStore {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await signIn(email, password);
            // El user se setea via onAuthChange en el AuthProvider
            set({ isLoading: false });
            return true;
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Credenciales incorrectas";
            set({ isLoading: false, error: msg });
            return false;
        }
    },

    logout: async () => {
        await signOutUser();
        set({ user: null });
    },

    clearError: () => set({ error: null }),
}));
