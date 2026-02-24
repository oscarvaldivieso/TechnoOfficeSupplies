import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";
import type { Product, Brand, Category } from "@/types/product";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
    bg: "#0f172a",        // slate-900
    surface: "#1e293b",  // slate-800
    border: "#334155",   // slate-700
    accent: "#3b82f6",   // blue-500
    accentLight: "#1d4ed8",
    white: "#f8fafc",
    muted: "#94a3b8",    // slate-400
    dim: "#475569",      // slate-600
    cardBg: "#1e293b",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        backgroundColor: C.bg,
        paddingHorizontal: 32,
        paddingVertical: 28,
        fontFamily: "Helvetica",
    },

    // ── Cover ──────────────────────────────────────────────────────────────────
    coverPage: {
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
    },
    coverAccentBar: {
        width: 56,
        height: 4,
        backgroundColor: C.accent,
        borderRadius: 2,
        marginBottom: 24,
    },
    coverTitle: {
        fontSize: 36,
        color: C.white,
        fontFamily: "Helvetica-Bold",
        textAlign: "center",
        letterSpacing: 1,
    },
    coverSubtitle: {
        fontSize: 14,
        color: C.muted,
        textAlign: "center",
        marginTop: 10,
    },
    coverDate: {
        fontSize: 10,
        color: C.dim,
        textAlign: "center",
        marginTop: 8,
    },
    coverDivider: {
        width: 120,
        height: 1,
        backgroundColor: C.border,
        marginTop: 40,
        marginBottom: 16,
    },
    coverStats: {
        fontSize: 11,
        color: C.muted,
        textAlign: "center",
    },

    // ── Page header ────────────────────────────────────────────────────────────
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    pageHeaderTitle: {
        fontSize: 10,
        color: C.muted,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    pageHeaderAccent: {
        fontSize: 10,
        color: C.accent,
    },

    // ── Grid ──────────────────────────────────────────────────────────────────
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    // ── Product card ──────────────────────────────────────────────────────────
    card: {
        width: "47.5%",
        backgroundColor: C.cardBg,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.border,
    },
    cardImage: {
        width: "100%",
        height: 130,
        objectFit: "cover",
        backgroundColor: "#0f1a2e",
    },
    cardImagePlaceholder: {
        width: "100%",
        height: 130,
        backgroundColor: "#162032",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardImagePlaceholderText: {
        fontSize: 9,
        color: C.dim,
    },
    cardBody: {
        padding: 10,
        gap: 4,
    },
    cardName: {
        fontSize: 11,
        color: C.white,
        fontFamily: "Helvetica-Bold",
        lineHeight: 1.35,
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 3,
    },
    cardBrand: {
        fontSize: 9,
        color: C.accent,
        fontFamily: "Helvetica-Bold",
    },
    cardSku: {
        fontSize: 8,
        color: C.dim,
        fontFamily: "Helvetica",
    },
    cardCategory: {
        fontSize: 8,
        color: C.muted,
        backgroundColor: "#263248",
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginTop: 4,
        alignSelf: "flex-start",
    },
    cardDesc: {
        fontSize: 8,
        color: C.muted,
        lineHeight: 1.4,
        marginTop: 4,
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    pageFooter: {
        position: "absolute",
        bottom: 18,
        left: 32,
        right: 32,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 8,
    },
    footerText: {
        fontSize: 8,
        color: C.dim,
    },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

interface EnrichedProduct extends Product {
    brandName?: string;
    categoryName?: string;
}

function ProductCard({ product }: { product: EnrichedProduct }) {
    const hasImage = product.image && product.image.trim() !== "";

    return (
        <View style={s.card}>
            {hasImage ? (
                <PDFImage src={product.image} style={s.cardImage} />
            ) : (
                <View style={s.cardImagePlaceholder}>
                    <Text style={s.cardImagePlaceholderText}>Sin imagen</Text>
                </View>
            )}

            <View style={s.cardBody}>
                <Text style={s.cardName}>{product.name}</Text>

                <View style={s.cardRow}>
                    <Text style={s.cardBrand}>{product.brandName ?? "—"}</Text>
                    <Text style={s.cardSku}>{product.sku}</Text>
                </View>

                {product.categoryName && product.categoryName !== "—" && (
                    <Text style={s.cardCategory}>{product.categoryName}</Text>
                )}

            </View>
        </View>
    );
}

function PageHeader({ page, total }: { page: number; total: number }) {
    return (
        <View style={s.pageHeader} fixed>
            <Text style={s.pageHeaderTitle}>Catálogo de Productos</Text>
            <Text style={s.pageHeaderAccent}>TechnoOffice Supplies</Text>
        </View>
    );
}

function PageFooter({ date }: { date: string }) {
    return (
        <View style={s.pageFooter} fixed>
            <Text style={s.footerText}>TechnoOffice Supplies · {date}</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
            } />
        </View>
    );
}

// ── Main Document ─────────────────────────────────────────────────────────────

interface CatalogPDFProps {
    products: EnrichedProduct[];
    brands: Brand[];
    categories: Category[];
}

export function CatalogPDF({ products, brands, categories }: CatalogPDFProps) {
    const date = new Date().toLocaleDateString("es-MX", {
        year: "numeric", month: "long", day: "numeric",
    });
    const uniqueBrands = [...new Set(products.map(p => p.brandName).filter(Boolean))].length;
    const uniqueCats = [...new Set(products.map(p => p.categoryName).filter(Boolean))].length;

    return (
        <Document
            title="Catálogo de Productos — TechnoOffice Supplies"
            author="TechnoOffice Supplies"
        >
            {/* ── Cover Page ── */}
            <Page size="A4" style={[s.page, s.coverPage]}>
                <View style={s.coverAccentBar} />
                <Text style={s.coverTitle}>Catálogo de{"\n"}Productos</Text>
                <Text style={s.coverSubtitle}>TechnoOffice Supplies</Text>
                <Text style={s.coverDate}>{date}</Text>

                <View style={s.coverDivider} />

                <Text style={s.coverStats}>
                    {products.length} productos  ·  {uniqueBrands} marcas  ·  {uniqueCats} categorías
                </Text>
            </Page>

            {/* ── Products Page ── */}
            <Page size="A4" style={s.page}>
                <PageHeader page={1} total={1} />

                <View style={s.grid}>
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </View>

                <PageFooter date={date} />
            </Page>
        </Document>
    );
}
