import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Product, ProductFormData, Brand, Category } from "@/types/product";

// ─── Helpers internos ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(id: string, data: Record<string, any>): Product {
    return {
        id,
        name: data.name ?? "",
        description: data.description ?? "",
        sku: data.SKU ?? data.sku ?? "",
        brand_id: data.brand_id ?? "",
        category_id: data.category_id ?? "",
        image: data.image ?? "",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBrand(id: string, data: Record<string, any>): Brand {
    return { id, name: data.name ?? "", logoUrl: data.logoUrl ?? "" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCategory(id: string, data: Record<string, any>): Category {
    return { id, name: data.name ?? "", icon: data.icon ?? "" };
}

// ─── Sellos de timestamps (solo para nuevos documentos) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTimestamp(data: Record<string, any>) {
    return { ...data, updatedAt: serverTimestamp() };
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

export async function getProducts(): Promise<Product[]> {
    console.log("DEBUG: Iniciando getProducts...");
    try {
        const colRef = collection(db, "products");
        const snap = await getDocs(colRef);
        console.log(`DEBUG: Se encontraron ${snap.docs.length} documentos en 'products'`);

        const products = snap.docs.map((d) => {
            const data = d.data();
            console.log("DEBUG: Documento crud:", d.id, data);
            return toProduct(d.id, data);
        });

        return products.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("DEBUG: Error en getProducts:", error);
        throw error;
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    return toProduct(snap.id, snap.data());
}

export async function createProduct(data: ProductFormData): Promise<string> {
    const payload = {
        name: data.name,
        description: data.description,
        SKU: data.sku,
        brand_id: data.brand_id,
        category_id: data.category_id,
        image: data.image,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "products"), payload);
    return ref.id;
}

export async function updateProduct(
    id: string,
    data: Partial<ProductFormData>
): Promise<void> {
    const payload: Record<string, unknown> = withTimestamp({});
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.sku !== undefined) payload.SKU = data.sku;
    if (data.brand_id !== undefined) payload.brand_id = data.brand_id;
    if (data.category_id !== undefined) payload.category_id = data.category_id;
    if (data.image !== undefined) payload.image = data.image;
    await updateDoc(doc(db, "products", id), payload);
}

export async function deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, "products", id));
}

// ══════════════════════════════════════════════════════════════════════════════
// BRANDS
// ══════════════════════════════════════════════════════════════════════════════

export async function getBrands(): Promise<Brand[]> {
    const q = query(collection(db, "brands"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBrand(d.id, d.data()));
}

export async function createBrand(data: Omit<Brand, "id">): Promise<string> {
    const ref = await addDoc(collection(db, "brands"), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

export async function updateBrand(id: string, data: Partial<Omit<Brand, "id">>): Promise<void> {
    await updateDoc(doc(db, "brands", id), data);
}

export async function deleteBrand(id: string): Promise<void> {
    await deleteDoc(doc(db, "brands", id));
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

export async function getCategories(): Promise<Category[]> {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => toCategory(d.id, d.data()));
}

export async function createCategory(data: Omit<Category, "id">): Promise<string> {
    const ref = await addDoc(collection(db, "categories"), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id">>): Promise<void> {
    await updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, "categories", id));
}
