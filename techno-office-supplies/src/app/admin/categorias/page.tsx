"use client";

import { useEffect, useState } from "react";
import {
    Plus, Search, Layers, Pencil, Trash2, AlertCircle, Loader2,
    Monitor, Printer, Folder, Keyboard, MousePointer2, HardDrive,
    Wifi, Camera, Headphones, Cpu, Tablet, Smartphone, Server, LampDesk, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/lib/store/categoryStore";
import { useProductStore } from "@/lib/store/productStore";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import type { Category } from "@/types/product";

// ── icon resolver ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
    monitor: Monitor,
    printer: Printer,
    folder: Folder,
    keyboard: Keyboard,
    "mouse-pointer-2": MousePointer2,
    "hard-drive": HardDrive,
    wifi: Wifi,
    camera: Camera,
    headphones: Headphones,
    cpu: Cpu,
    tablet: Tablet,
    smartphone: Smartphone,
    server: Server,
    "lamp-desk": LampDesk,
    package: Package,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
    const Icon = ICON_MAP[name] ?? Layers;
    return <Icon className={className} />;
}

// ── confirm dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl w-80 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-500/10 p-2 mt-0.5">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-white">¿Eliminar categoría?</p>
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

// ── category chip card ─────────────────────────────────────────────────────────
function CategoryCard({
    category,
    productCount,
    onEdit,
    onDelete,
}: {
    category: Category;
    productCount: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900 px-4 py-3 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/60">
            {/* Icon bubble */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                <CategoryIcon name={category.icon} className="h-4 w-4 text-violet-400" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{category.name}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{category.icon}</p>
            </div>

            {/* Product count */}
            <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                {productCount}p
            </span>

            {/* Actions — always visible on mobile, hover-only on desktop */}
            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 shrink-0">
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
    );
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function CategoriasPage() {
    const { categories, isLoading, error, fetchCategories, addCategory, editCategory, removeCategory, clearError } =
        useCategoryStore();
    const { products, fetchAll: fetchProducts } = useProductStore();

    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [deletingCat, setDeletingCat] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
        if (products.length === 0) fetchProducts();
    }, [fetchCategories, fetchProducts, products.length]);

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const productCountFor = (catId: string) =>
        products.filter((p) => p.category_id === catId).length;

    async function handleSubmit(data: Omit<Category, "id">) {
        if (editingCat?.id) {
            await editCategory(editingCat.id, data);
        } else {
            await addCategory(data);
        }
    }

    async function handleDelete() {
        if (!deletingCat?.id) return;
        await removeCategory(deletingCat.id);
        setDeletingCat(null);
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Categorías</h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {categories.length} categoría{categories.length !== 1 ? "s" : ""} registrada{categories.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Button onClick={() => { setEditingCat(null); setDialogOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva categoría
                    </Button>
                </div>

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
                    placeholder="Buscar categoría..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-violet-500/50"
                />
            </div>

            {/* ── Loading ── */}
            {isLoading && categories.length === 0 && (
                <div className="flex items-center gap-3 text-slate-400 py-12 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando categorías...</span>
                </div>
            )}

            {/* ── Empty ── */}
            {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
                        <Layers className="h-9 w-9 text-slate-600 mx-auto" />
                    </div>
                    <div>
                        <p className="text-slate-300 font-medium">
                            {search ? "Sin resultados" : "Aún no hay categorías"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {search ? "Intenta con otro término." : "Crea la primera categoría para organizar los productos."}
                        </p>
                    </div>
                    {!search && (
                        <Button
                            variant="outline"
                            onClick={() => { setEditingCat(null); setDialogOpen(true); }}
                            className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Nueva categoría
                        </Button>
                    )}
                </div>
            )}

            {/* ── List ── */}
            {filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filtered.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            productCount={productCountFor(cat.id!)}
                            onEdit={() => { setEditingCat(cat); setDialogOpen(true); }}
                            onDelete={() => setDeletingCat(cat)}
                        />
                    ))}
                </div>
            )}

            {/* ── Dialog ── */}
            <CategoryFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
                category={editingCat}
            />

            {/* ── Confirm ── */}
            {deletingCat && (
                <ConfirmDialog
                    name={deletingCat.name}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingCat(null)}
                />
            )}
        </div>
    );
}
