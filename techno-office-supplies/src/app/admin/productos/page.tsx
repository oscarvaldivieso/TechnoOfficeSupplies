"use client";

import { useEffect, useRef, useState } from "react";
import { useProductStore } from "@/lib/store/productStore";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/products/DeleteConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductFormData } from "@/types/product";
import { AnimatedCard, AnimatedCardHandle } from "@/components/animations/AnimatedCard";

export default function ProductosPage() {
    const {
        products, brands, categories,
        isLoading, fetchAll,
        addProduct, editProduct, removeProduct,
    } = useProductStore();

    // ── Dialog state ─────────────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // ── Animation state ───────────────────────────────────────────────────────
    /** ID of the product that was just created — receives pop-in animation */
    const [newProductId, setNewProductId] = useState<string | null>(null);
    /** Refs keyed by product.id for triggering exit animations */
    const cardRefs = useRef<Map<string, AnimatedCardHandle>>(new Map());

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Export PDF ────────────────────────────────────────────────────────────

    /**
     * Convierte una URL de imagen externa (Cloudinary) a un data URL Base64.
     * @react-pdf/renderer no puede cargar URLs externas directamente por CORS,
     * pero sí puede renderizar data URLs Base64.
     */
    async function imageUrlToBase64(url: string): Promise<string> {
        try {
            // Usamos el proxy del servidor para evitar restricciones CORS con Cloudinary
            const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) return "";
            const { dataUrl } = await response.json();
            return dataUrl ?? "";
        } catch {
            return "";
        }
    }

    async function handleExportPDF() {
        setIsExporting(true);
        try {
            console.log("[PDF] Paso 1: Cargando fondo e imágenes...");
            // Cargar imagen de fondo y productos en paralelo
            const snapshot = products.map((p) => ({
                ...p,
                brandName: brands.find((b) => b.id === p.brand_id)?.name ?? "—",
                categoryName: categories.find((c) => c.id === p.category_id)?.name ?? "—",
            }));

            const [backgroundBase64, productsWithBase64] = await Promise.all([
                imageUrlToBase64("/images/fondo.jpeg"),
                Promise.all(
                    snapshot.map(async (p) => ({
                        ...p,
                        image: p.image ? await imageUrlToBase64(p.image) : "",
                    }))
                ),
            ]);
            console.log("[PDF] Paso 2: Imágenes listas. Fondo:", backgroundBase64.length > 0 ? "OK" : "no cargó");

            console.log("[PDF] Paso 3: Importando react-pdf...");
            const [{ pdf }, { CatalogPDF }] = await Promise.all([
                import("@react-pdf/renderer"),
                import("@/components/products/CatalogPDF"),
            ]);
            console.log("[PDF] Paso 4: Generando blob...");
            const blob = await pdf(
                <CatalogPDF
                    products={productsWithBase64}
                    brands={brands}
                    categories={categories}
                    backgroundBase64={backgroundBase64}
                />
            ).toBlob();
            console.log("[PDF] Paso 5: Descargando...", blob.size, "bytes");

            // El navegador puede bloquear a.click() con blob URLs después de operaciones async.
            // Usamos FileReader para convertir a data URL, que es más compatible.
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = `catalogo-productos-${new Date().toISOString().slice(0, 10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                console.log("[PDF] ✅ Descarga completada");
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error("[PDF] ❌ Error:", err);
            toast.error("Error al generar el PDF");
        } finally {
            setIsExporting(false);
        }
    }

    // Clear the "new" highlight after a brief window so it doesn't re-fire on re-renders
    useEffect(() => {
        if (!newProductId) return;
        const t = setTimeout(() => setNewProductId(null), 1000);
        return () => clearTimeout(t);
    }, [newProductId]);

    // ── Enriched products ─────────────────────────────────────────────────────
    const enrichedProducts = products.map((p) => ({
        ...p,
        brandName: brands.find((b) => b.id === p.brand_id)?.name ?? "—",
        categoryName: categories.find((c) => c.id === p.category_id)?.name ?? "—",
    }));

    // ── Handlers ──────────────────────────────────────────────────────────────
    function openCreate() { setSelected(null); setFormOpen(true); }
    function openEdit(p: Product) { setSelected(p); setFormOpen(true); }
    function openDelete(p: Product) { setSelected(p); setDeleteOpen(true); }

    async function handleSubmitForm(data: ProductFormData) {
        if (selected?.id) {
            await editProduct(selected.id, data);
            toast.success("Producto actualizado correctamente");
        } else {
            await addProduct(data);
            toast.success("Producto creado correctamente");
            // Flag resolved in useEffect: finds product id not yet in cardRefs
            setNewProductId("__next__");
        }
    }

    // Resolve the actual new product id once the store updates
    const prevCountRef = useRef(products.length);
    useEffect(() => {
        if (newProductId !== "__next__") {
            prevCountRef.current = products.length;
            return;
        }
        if (products.length > prevCountRef.current) {
            // The new product is whichever id wasn't there before
            // Products are sorted alphabetically, so we can't just take last —
            // mark all current ids as "new candidates" isn't right either.
            // Best approach: store picks the newly added product first, so
            // we diff against a stored snapshot.
            prevCountRef.current = products.length;
            // Tag the first product not in our known set as new
            const newP = products.find((p) => !cardRefs.current.has(p.id!));
            if (newP?.id) setNewProductId(newP.id);
            else setNewProductId(null);
        }
    }, [products, newProductId]);

    async function handleConfirmDelete() {
        if (!selected?.id) return;
        setIsDeleting(true);

        const cardHandle = cardRefs.current.get(selected.id);
        const doDelete = async () => {
            await removeProduct(selected.id!);
            toast.success(`"${selected.name}" eliminado`);
            setIsDeleting(false);
            setDeleteOpen(false);
            setSelected(null);
        };

        if (cardHandle) {
            setDeleteOpen(false); // close dialog first so animation is visible
            cardHandle.triggerExit(doDelete);
        } else {
            await doDelete();
        }
    }

    return (
        <div className="space-y-6">
            {/* Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Catálogo de Productos</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {isLoading
                            ? "Cargando..."
                            : `${products.length} producto${products.length !== 1 ? "s" : ""} registrado${products.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2 border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                        onClick={handleExportPDF}
                        disabled={isExporting || isLoading || products.length === 0}
                    >
                        {isExporting
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
                            : <><FileDown className="h-4 w-4" />Exportar PDF</>}
                    </Button>
                    <Button className="gap-2" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Nuevo producto
                    </Button>
                </div>
            </div>

            {/* Grid ────────────────────────────────────────────────────────────── */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : enrichedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <PackageOpen className="h-14 w-14 text-slate-700 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-400">Sin productos aún</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Agrega tu primer producto con el botón de arriba.
                    </p>
                    <Button className="mt-6 gap-2" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Agregar producto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {enrichedProducts.map((product, i) => (
                        <AnimatedCard
                            key={product.id}
                            index={i}
                            isNew={product.id === newProductId}
                            ref={(handle) => {
                                if (handle) cardRefs.current.set(product.id!, handle);
                                else cardRefs.current.delete(product.id!);
                            }}
                        >
                            <ProductCard
                                product={product}
                                onEdit={openEdit}
                                onDelete={openDelete}
                            />
                        </AnimatedCard>
                    ))}
                </div>
            )}

            {/* Dialogs ─────────────────────────────────────────────────────────── */}
            <ProductFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmitForm}
                brands={brands}
                categories={categories}
                product={selected}
            />
            <DeleteConfirmDialog
                open={deleteOpen}
                productName={selected?.name ?? ""}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => { setDeleteOpen(false); setSelected(null); }}
            />
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <Skeleton className="h-44 w-full rounded-none bg-slate-800" />
            <div className="p-3.5 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-1/2 bg-slate-800" />
                <Skeleton className="h-3 w-full bg-slate-800" />
            </div>
        </div>
    );
}
