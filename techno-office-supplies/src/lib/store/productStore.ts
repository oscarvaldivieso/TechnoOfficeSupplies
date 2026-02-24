import { create } from "zustand";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getBrands,
    getCategories,
} from "@/lib/firebase/firestore";
import type { Product, ProductFormData, Brand, Category } from "@/types/product";

interface ProductStore {
    // ─── Estado ────────────────────────────────────────────────────────────────
    products: Product[];
    brands: Brand[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    // ─── Acciones de datos maestros ────────────────────────────────────────────
    fetchAll: () => Promise<void>;  // carga productos + brands + categories en paralelo

    // ─── CRUD Productos ────────────────────────────────────────────────────────
    addProduct: (data: ProductFormData) => Promise<void>;
    editProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>;
    removeProduct: (id: string) => Promise<void>;

    // ─── Utilidades ───────────────────────────────────────────────────────────
    clearError: () => void;
    getBrandName: (brand_id: string) => string;
    getCategoryName: (category_id: string) => string;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    brands: [],
    categories: [],
    isLoading: false,
    error: null,

    // Carga los 3 datasets en paralelo para minimizar tiempo de espera
    fetchAll: async () => {
        console.log("DEBUG: Store - Iniciando fetchAll...");
        set({ isLoading: true, error: null });
        try {
            const [products, brands, categories] = await Promise.all([
                getProducts(),
                getBrands(),
                getCategories(),
            ]);
            console.log("DEBUG: Store - Datos cargados:", {
                products: products.length,
                brands: brands.length,
                categories: categories.length
            });
            set({ products, brands, categories, isLoading: false });
        } catch (err) {
            console.error("DEBUG: Store - Error en fetchAll:", err);
            set({ error: "Error al cargar los datos", isLoading: false });
        }
    },

    addProduct: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const id = await createProduct(data);
            const { brands, categories } = get();
            const brand = brands.find((b) => b.id === data.brand_id);
            const category = categories.find((c) => c.id === data.category_id);
            const newProduct: Product = {
                ...data,
                id,
                brandName: brand?.name,
                categoryName: category?.name,
            };
            set((state) => ({
                products: [...state.products, newProduct].sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
                isLoading: false,
            }));
        } catch (err) {
            set({ error: "Error al crear el producto", isLoading: false });
            console.error(err);
        }
    },

    editProduct: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await updateProduct(id, data);
            const { brands, categories } = get();
            set((state) => ({
                products: state.products
                    .map((p) => {
                        if (p.id !== id) return p;
                        const updated = { ...p, ...data };
                        const brand = brands.find((b) => b.id === updated.brand_id);
                        const category = categories.find((c) => c.id === updated.category_id);
                        return {
                            ...updated,
                            brandName: brand?.name ?? p.brandName,
                            categoryName: category?.name ?? p.categoryName,
                        };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name)),
                isLoading: false,
            }));
        } catch (err) {
            set({ error: "Error al actualizar el producto", isLoading: false });
            console.error(err);
        }
    },

    removeProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await deleteProduct(id);
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
                isLoading: false,
            }));
        } catch (err) {
            set({ error: "Error al eliminar el producto", isLoading: false });
            console.error(err);
        }
    },

    clearError: () => set({ error: null }),

    // Helpers de join local (evitan lookups repetidos en los componentes)
    getBrandName: (brand_id) => {
        const brand = get().brands.find((b) => b.id === brand_id);
        return brand?.name ?? "—";
    },
    getCategoryName: (category_id) => {
        const cat = get().categories.find((c) => c.id === category_id);
        return cat?.name ?? "—";
    },
}));
