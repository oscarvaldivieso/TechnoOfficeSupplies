import { create } from "zustand";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/lib/firebase/firestore";
import type { Category } from "@/types/product";

interface CategoryStore {
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    addCategory: (data: Omit<Category, "id">) => Promise<void>;
    editCategory: (id: string, data: Partial<Omit<Category, "id">>) => Promise<void>;
    removeCategory: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categories = await getCategories();
            set({ categories, isLoading: false });
        } catch {
            set({ error: "Error al cargar las categorías", isLoading: false });
        }
    },

    addCategory: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await createCategory(data);
            const newCat: Category = { ...data, id };
            set((state) => ({
                categories: [...state.categories, newCat].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al crear la categoría", isLoading: false });
        }
    },

    editCategory: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await updateCategory(id, data);
            set((state) => ({
                categories: state.categories
                    .map((c) => (c.id === id ? { ...c, ...data } : c))
                    .sort((a, b) => a.name.localeCompare(b.name)),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al actualizar la categoría", isLoading: false });
        }
    },

    removeCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteCategory(id);
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
                isLoading: false,
            }));
        } catch {
            set({ error: "Error al eliminar la categoría", isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
