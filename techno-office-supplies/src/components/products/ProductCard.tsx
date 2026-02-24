"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ImageOff, Tag } from "lucide-react";

interface ProductCardProps {
    product: Product & { brandName?: string; categoryName?: string };
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const hasImage = product.image && product.image.trim() !== "";

    return (
        <div className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden transition-all duration-200 hover:border-slate-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5">

            {/* ── Image area ── */}
            <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                {hasImage ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
                        <ImageOff className="h-9 w-9" />
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}

                {/* Bottom gradient for badge legibility */}
                {hasImage && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
                )}

                {/* Category chip — bottom-left over gradient */}
                {product.categoryName && product.categoryName !== "—" && (
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-medium text-slate-300 bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 rounded-full px-2 py-0.5">
                        {product.categoryName}
                    </span>
                )}

                {/* Hover overlay — edit / delete */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px]">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit?.(product)}
                        className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 border-0 text-white"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete?.(product)}
                        className="h-8 w-8 p-0"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* ── Info strip ── */}
            <div className="flex flex-col gap-1.5 px-3.5 py-3">
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between gap-2">
                    {product.brandName && product.brandName !== "—" ? (
                        <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                            <Tag className="h-3 w-3" />
                            {product.brandName}
                        </span>
                    ) : <span />}

                    {product.sku && (
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {product.sku}
                        </span>
                    )}
                </div>

                {product.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}
            </div>
        </div>
    );
}
