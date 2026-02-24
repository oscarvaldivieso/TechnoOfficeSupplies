import { create } from "zustand";
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "@/lib/firebase/firestore";
import type { Brand } from "@/types/product";

interface BrandStore {
    brands: Brand[];
    isLoading: boolean;
    error: string | null;

    fetchBrands: () => Promise<void>;
    addBrand: (data: Omit<Brand, "id">) => Promise<void>;
    editBrand: (id: string, data: Partial<Omit<Brand, "id">>) => Promise<void>;
    removeBrand: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useBrandStore = create<BrandStore>((set, get) => ({
    brands: [],
    isLoading: false,
    error: null,

    fetchBrands: async () => {
        set({ isLoading: true, error: null });
        try {
            const brands = await getBrands();
            set({ brands, isLoading: false });
        } catch {
            set({ error: "Error al cargar las marcas", isLoading: false });
        }
    },

    addBrand: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await createBrand(data);
            const newBrand: Brand = { ...data, id };
            set((state) => ({
                brands: [...state.brands, newBrand].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al crear la marca", isLoading: false });
        }
    },

    editBrand: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await updateBrand(id, data);
            set((state) => ({
                brands: state.brands
                    .map((b) => (b.id === id ? { ...b, ...data } : b))
                    .sort((a, b) => a.name.localeCompare(b.name)),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al actualizar la marca", isLoading: false });
        }
    },

    removeBrand: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteBrand(id);
            set((state) => ({
                brands: state.brands.filter((b) => b.id !== id),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al eliminar la marca", isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
