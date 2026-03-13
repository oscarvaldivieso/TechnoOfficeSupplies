import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    StyleSheet,
    Font,  // ← IMPORTANTE: Importar Font
} from "@react-pdf/renderer";
import type { Product, Brand, Category } from "@/types/product";

// ══════════════════════════════════════════════════════════════════════════════
// ── REGISTRAR FUENTES ONEST ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

Font.register({
    family: "Onest",
    fonts: [
        {
            src: "/fonts/Onest-Regular.ttf",  // Ruta desde public/ o src/fonts/
            fontWeight: 400,
        },
        {
            src: "/fonts/Onest-Bold.ttf",
            fontWeight: 700,
        },
        // Opcional: Medium
        {
            src: "/fonts/Onest-Medium.ttf",
            fontWeight: 500,
        },
        // Opcional: SemiBold
        {
            src: "/fonts/Onest-SemiBold.ttf",
            fontWeight: 600,
        },
        // Opcional: Light
        {
            src: "/fonts/Onest-Light.ttf",
            fontWeight: 300,
        },
    ],
});

// ══════════════════════════════════════════════════════════════════════════════
// ── PALETA DE COLORES ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const C = {
    neon: "#00f5ff",
    neonGlow: "#00d9ff",
    primary: "#0a84ff",
    accent: "#6366f1",
    purple: "#8b5cf6",
    pink: "#ec4899",

    bgDark: "#0a0e27",
    cardBg: "#ffffff",

    text: "#0f172a",
    textMuted: "#64748b",
    textLight: "#94a3b8",
    white: "#ffffff",

    border: "#e2e8f0",
    borderAccent: "#cbd5e1",
    gradient1: "#0ea5e9",
    gradient2: "#8b5cf6",
};

// ══════════════════════════════════════════════════════════════════════════════
// ── ESTILOS (Ahora usando Onest) ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
    page: {
        fontFamily: "Onest",  // ← Cambiar de "Helvetica" a "Onest"
        backgroundColor: "#0a0e27",
        position: "relative",
    },

    bgImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.08,
    },

    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 54,
    },

    // ── Cover ─────────────────────────────────────────────────────────────────
    coverContent: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 56,
        paddingVertical: 70,
    },
    coverChip: {
        backgroundColor: C.neon,
        borderRadius: 6,
        paddingHorizontal: 18,
        paddingVertical: 7,
        marginBottom: 36,
        borderWidth: 1,
        borderColor: C.neonGlow,
    },
    coverChipText: {
        fontSize: 10,
        color: C.bgDark,
        fontWeight: 700,  // ← Usar fontWeight en lugar de fontFamily: "Onest-Bold"
        letterSpacing: 4,
        textTransform: "uppercase",
    },
    coverTitle: {
        fontSize: 56,
        color: C.white,
        fontWeight: 700,  // ← Bold
        textAlign: "center",
        lineHeight: 1.1,
        letterSpacing: 3,
    },
    coverTitleAccent: {
        fontSize: 56,
        color: C.neon,
        fontWeight: 700,  // ← Bold
        textAlign: "center",
        lineHeight: 1.1,
        letterSpacing: 3,
    },
    coverSubtitle: {
        fontSize: 15,
        color: C.textLight,
        textAlign: "center",
        marginTop: 18,
        letterSpacing: 0.8,
        fontWeight: 400,  // ← Regular
    },
    coverRule: {
        width: "100%",
        height: 2,
        backgroundColor: C.neon,
        marginTop: 52,
        marginBottom: 40,
        opacity: 0.4,
    },
    coverStatsRow: {
        flexDirection: "row",
        gap: 56,
    },
    coverStat: {
        alignItems: "center",
        gap: 7,
    },
    coverStatNum: {
        fontSize: 40,
        color: C.neon,
        fontWeight: 700,  // ← Bold
    },
    coverStatLabel: {
        fontSize: 10,
        color: C.textLight,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        fontWeight: 500,  // ← Medium
    },
    coverDate: {
        marginTop: 70,
        fontSize: 11,
        color: C.textLight,
        letterSpacing: 1.2,
        fontWeight: 400,  // ← Regular
    },

    // ── Page Header ───────────────────────────────────────────────────────────
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        backgroundColor: "rgba(0, 245, 255, 0.05)",
        borderBottomWidth: 2,
        borderBottomColor: C.neon,
        marginBottom: 0,
    },
    pageHeaderTitle: {
        fontSize: 11,
        color: C.white,
        fontWeight: 700,  // ← Bold
        letterSpacing: 3.5,
        textTransform: "uppercase",
    },
    pageHeaderBrand: {
        fontSize: 11,
        color: C.neon,
        fontWeight: 700,  // ← Bold
        letterSpacing: 1.8,
    },

    // ── Category Section ──────────────────────────────────────────────────────
    categorySection: {
        marginTop: 28,
        marginBottom: 18,
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        paddingHorizontal: 2,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.neon,
    },
    categoryTitle: {
        fontSize: 25,
        color: C.white,
        fontWeight: 700,  // ← Bold
        textTransform: "uppercase",
    },
    categoryUnderline: {
        height: 2,
        backgroundColor: C.neon,
        marginLeft: 12,
        flex: 1,
        opacity: 0.3,
    },

    // ── Grid ──────────────────────────────────────────────────────────────────
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    card: {
        width: "48%",
        backgroundColor: C.cardBg,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1,
        borderColor: C.border,
    },
    cardCornerDecor: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        backgroundColor: C.neon,
        opacity: 0.1,
    },
    cardImageWrap: {
        position: "relative",
        width: "100%",
        height: 150,
        backgroundColor: "#f8fafc",
        borderBottomWidth: 3,
        borderBottomColor: C.neon,
    },
    cardImage: {
        width: "100%",
        height: 150,
        objectFit: "cover",
    },
    cardPlaceholder: {
        width: "100%",
        height: 150,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    cardPlaceholderIcon: {
        fontSize: 32,
        color: C.textMuted,
        marginBottom: 8,
    },
    cardPlaceholderText: {
        fontSize: 9,
        color: C.textMuted,
        letterSpacing: 2,
        textTransform: "uppercase",
        fontWeight: 500,  // ← Medium
    },
    cardSkuBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: C.bgDark,
        borderRadius: 6,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderWidth: 1.5,
        borderColor: C.neon,
    },
    cardSkuText: {
        fontSize: 10,
        color: C.neon,
        fontWeight: 700,  // ← Bold
        textTransform: "uppercase",
    },
    cardBody: {
        padding: 14,
        gap: 8,
    },
    cardName: {
        fontSize: 15,
        textTransform: "uppercase",
        color: C.text,
        fontWeight: 700,  // ← Bold
        lineHeight: 1.2,
    },
    cardDescription: {
        fontSize: 9,
        color: C.textMuted,
        fontWeight: 400,
        lineHeight: 1.4,
        marginTop: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: C.border,
        marginVertical: 1,
    },
    cardMetaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    cardBrand: {
        fontSize: 11,
        color: C.primary,
        fontWeight: 600,  // ← SemiBold
        letterSpacing: 0.4,
    },
    cardFooterBar: {
        flexDirection: "row",
        gap: 4,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    cardFooterDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: C.neon,
    },

    // ── Page Footer ───────────────────────────────────────────────────────────
    pageFooter: {
        position: "absolute",
        bottom: 18,
        left: 24,
        right: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 2,
        borderTopColor: C.neon,
        paddingTop: 9,
    },
    footerText: {
        fontSize: 8.5,
        color: C.textLight,
        letterSpacing: 0.6,
        fontWeight: 400,  // ← Regular
    },
    footerPage: {
        fontSize: 8.5,
        color: C.neon,
        fontWeight: 700,  // ← Bold
        letterSpacing: 0.6,
    },
});

// ══════════════════════════════════════════════════════════════════════════════
// ── RESTO DEL CÓDIGO (sin cambios) ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

interface EnrichedProduct extends Product {
    brandName?: string;
    categoryName?: string;
}

interface CatalogPDFProps {
    products: EnrichedProduct[];
    brands: Brand[];
    categories: Category[];
    backgroundBase64?: string;
}

function ProductCard({ product }: { product: EnrichedProduct }) {
    const hasImage = !!product.image?.trim();

    return (
        <View style={s.card}>
            <View style={s.cardCornerDecor} />

            <View style={s.cardImageWrap}>
                {hasImage ? (
                    <PDFImage src={product.image} style={s.cardImage} />
                ) : (
                    <View style={s.cardPlaceholder}>
                        <Text style={s.cardPlaceholderIcon}>📦</Text>
                        <Text style={s.cardPlaceholderText}>Sin Imagen</Text>
                    </View>
                )}

                {product.sku && (
                    <View style={s.cardSkuBadge}>
                        <Text style={s.cardSkuText}>{product.sku}</Text>
                    </View>
                )}
            </View>

            <View style={s.cardBody}>
                <Text style={s.cardName}>{product.name}</Text>

                {product.description && (
                    <Text style={s.cardDescription}>
                        {product.description}
                    </Text>
                )}

                <View style={s.cardDivider} />

                <View style={s.cardMetaRow}>
                    <Text style={s.cardBrand}>{product.brandName ?? "—"}</Text>
                </View>
            </View>

            <View style={s.cardFooterBar}>
                <View style={s.cardFooterDot} />
                <View style={s.cardFooterDot} />
                <View style={s.cardFooterDot} />
            </View>
        </View>
    );
}

function PageHeader() {
    return (
        <View style={s.pageHeader} fixed>
            <Text style={s.pageHeaderTitle}>Catálogo de Productos</Text>
            <Text style={s.pageHeaderBrand}>TechnoOffice Supplies</Text>
        </View>
    );
}

function PageFooter({ date }: { date: string }) {
    return (
        <View style={s.pageFooter} fixed>
            <Text style={s.footerText}>TechnoOffice Supplies · {date}</Text>
            <Text
                style={s.footerPage}
                render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
        </View>
    );
}

function BackgroundImage({ src }: { src?: string }) {
    if (!src) return null;
    return <PDFImage src={src} style={s.bgImage} fixed />;
}

export function CatalogPDF({ products, brands, categories, backgroundBase64 }: CatalogPDFProps) {
    const date = new Date().toLocaleDateString("es-HN", {
        year: "numeric", month: "long", day: "numeric",
    });

    const productsByCategory = new Map<string, EnrichedProduct[]>();

    products.forEach(product => {
        const categoryName = product.categoryName || "Sin Categoría";
        if (!productsByCategory.has(categoryName)) {
            productsByCategory.set(categoryName, []);
        }
        productsByCategory.get(categoryName)!.push(product);
    });

    const sortedCategories = Array.from(productsByCategory.keys()).sort();

    const uniqueBrands = [...new Set(products.map((p) => p.brandName).filter(Boolean))].length;
    const uniqueCats = sortedCategories.length;

    return (
        <Document
            title="Catálogo de Productos — TechnoOffice Supplies"
            author="TechnoOffice Supplies"
        >
            <Page size="A4" style={s.page}>
                <BackgroundImage src={backgroundBase64} />

                <View style={s.coverContent}>
                    <View style={s.coverChip}>
                        <Text style={s.coverChipText}>Catálogo Oficial</Text>
                    </View>

                    <Text style={s.coverTitle}>TECHNO{"\n"}</Text>
                    <Text style={s.coverTitleAccent}>OFFICE SUPPLIES</Text>
                    <Text style={s.coverSubtitle}>
                        Soluciones tecnológicas para tu empresa
                    </Text>

                    <View style={s.coverRule} />


                    <Text style={s.coverDate}>{date}</Text>
                </View>
            </Page>

            {sortedCategories.map((categoryName) => {
                const categoryProducts = productsByCategory.get(categoryName)!;

                const productsPerPage = 4;
                const pageGroups: EnrichedProduct[][] = [];

                for (let i = 0; i < categoryProducts.length; i += productsPerPage) {
                    pageGroups.push(categoryProducts.slice(i, i + productsPerPage));
                }

                return pageGroups.map((group, pageIdx) => (
                    <Page
                        key={`${categoryName}-${pageIdx}`}
                        size="A4"
                        style={s.page}
                    >
                        <BackgroundImage src={backgroundBase64} />
                        <PageHeader />

                        <View style={s.content}>
                            {pageIdx === 0 && (
                                <View style={s.categoryHeader}>
                                    <View style={s.categoryDot} />
                                    <Text style={s.categoryTitle}>{categoryName}</Text>
                                    <View style={s.categoryUnderline} />
                                </View>
                            )}

                            <View style={s.grid}>
                                {group.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </View>
                        </View>

                        <PageFooter date={date} />
                    </Page>
                ));
            })}
        </Document>
    );
}