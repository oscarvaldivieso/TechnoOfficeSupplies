// ─── Brands ───────────────────────────────────────────────────────────────────
export interface Brand {
    id?: string;       // brand_id en Firestore
    name: string;
    logoUrl: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface Category {
    id?: string;       // category_id en Firestore
    name: string;
    icon: string;      // nombre del icono (ej: "monitor", "printer", "folder")
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
    id?: string;       // product_id en Firestore
    name: string;
    description: string;
    sku: string;
    brand_id: string;
    category_id: string;
    image: string;     // URL de la imagen (Cloudinary u otro host)
    // Campos opcionales para enriquecer la UI (join local)
    brandName?: string;
    categoryName?: string;
}

export type ProductFormData = Omit<Product, "id" | "brandName" | "categoryName">;
