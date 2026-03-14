"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Search, Tag, Pencil, Trash2, AlertCircle, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrandStore } from "@/lib/store/brandStore";
import { useProductStore } from "@/lib/store/productStore";
import { BrandFormDialog } from "@/components/brands/BrandFormDialog";
import type { Brand } from "@/types/product";

// ── simple confirmation dialog helper ──────────────────────────────────────────
function ConfirmDialog({
    name,
    onConfirm,
    onCancel,
}: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl w-80 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-500/10 p-2 mt-0.5">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-white">¿Eliminar marca?</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Se eliminará <span className="text-white font-medium">{name}</span> de forma permanente.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onCancel}
                        className="text-slate-400 hover:text-white hover:bg-slate-800">
                        Cancelar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onConfirm}>
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── brand card ─────────────────────────────────────────────────────────────────
function BrandCard({
    brand,
    productCount,
    onEdit,
    onDelete,
}: {
    brand: Brand;
    productCount: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5">
            {/* Logo area — fills full width, no overlay */}
            <div className="relative h-36 w-full bg-slate-800 overflow-hidden">
                {brand.logoUrl ? (
                    <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Tag className="h-10 w-10 text-slate-600" />
                    </div>
                )}
            </div>

            {/* Info strip — name + product count + action buttons always visible */}
            <div className="px-3 py-2 flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate flex-1">{brand.name}</p>
                <span className="shrink-0 text-xs text-slate-500">{productCount}p</span>
                <div className="flex gap-1 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onEdit}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onDelete}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function MarcasPage() {
    const { brands, isLoading, error, fetchBrands, addBrand, editBrand, removeBrand, clearError } =
        useBrandStore();
    const { products, fetchAll: fetchProducts } = useProductStore();

    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

    useEffect(() => {
        fetchBrands();
        // fetch products only if not already loaded (to count per brand)
        if (products.length === 0) fetchProducts();
    }, [fetchBrands, fetchProducts, products.length]);

    const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const productCountForBrand = (brandId: string) =>
        products.filter((p) => p.brand_id === brandId).length;

    function openCreate() {
        setEditingBrand(null);
        setDialogOpen(true);
    }
    function openEdit(brand: Brand) {
        setEditingBrand(brand);
        setDialogOpen(true);
    }
    async function handleSubmit(data: Omit<Brand, "id">) {
        if (editingBrand?.id) {
            await editBrand(editingBrand.id, data);
        } else {
            await addBrand(data);
        }
    }
    async function handleDelete() {
        if (!deletingBrand?.id) return;
        await removeBrand(deletingBrand.id);
        setDeletingBrand(null);
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Marcas</h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {brands.length} marca{brands.length !== 1 ? "s" : ""} registrada{brands.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva marca
                    </Button>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300 underline text-xs">
                            Cerrar
                        </button>
                    </div>
                )}
            </div>

            {/* ── Search ── */}
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                    placeholder="Buscar marca..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                />
            </div>

            {/* ── Loading ── */}
            {isLoading && brands.length === 0 && (
                <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando marcas...</span>
                </div>
            )}

            {/* ── Empty state ── */}
            {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
                        <ImageOff className="h-10 w-10 text-slate-600 mx-auto" />
                    </div>
                    <div>
                        <p className="text-slate-300 font-medium">
                            {search ? "Sin resultados para tu búsqueda" : "Aún no hay marcas"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {search ? "Intenta con otro término." : "Agrega la primera marca para comenzar."}
                        </p>
                    </div>
                    {!search && (
                        <Button onClick={openCreate} variant="outline"
                            className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
                            <Plus className="h-4 w-4 mr-2" /> Nueva marca
                        </Button>
                    )}
                </div>
            )}

            {/* ── Brand grid ── */}
            {filtered.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((brand) => (
                        <BrandCard
                            key={brand.id}
                            brand={brand}
                            productCount={productCountForBrand(brand.id!)}
                            onEdit={() => openEdit(brand)}
                            onDelete={() => setDeletingBrand(brand)}
                        />
                    ))}
                </div>
            )}

            {/* ── Form Dialog ── */}
            <BrandFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
                brand={editingBrand}
            />

            {/* ── Delete Confirm ── */}
            {deletingBrand && (
                <ConfirmDialog
                    name={deletingBrand.name}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingBrand(null)}
                />
            )}
        </div>
    );
}
