import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Proxy de imágenes para evitar problemas de CORS al generar PDFs.
 * Soporta:
 *  - URLs de Cloudinary (externas)
 *  - Rutas locales /images/* desde la carpeta public/
 *
 * Uso:
 *   GET /api/image-proxy?url=https://res.cloudinary.com/...
 *   GET /api/image-proxy?url=/images/fondo.jpeg
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
    }

    // ── Imágenes locales de /public ────────────────────────────────────────────
    if (imageUrl.startsWith("/images/")) {
        try {
            const safeName = path.basename(imageUrl); // protección path traversal
            const filePath = path.join(process.cwd(), "public", "images", safeName);
            const buffer = await readFile(filePath);
            const ext = path.extname(safeName).toLowerCase().replace(".", "");
            const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
            const base64 = buffer.toString("base64");
            return NextResponse.json({ dataUrl: `data:${mime};base64,${base64}` });
        } catch (error) {
            console.error("[image-proxy] Error reading local file:", error);
            return NextResponse.json({ error: "Local file not found" }, { status: 404 });
        }
    }

    // ── Solo permitir URLs de Cloudinary para externas ─────────────────────────
    if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
        return NextResponse.json({ error: "Only Cloudinary URLs are allowed" }, { status: 403 });
    }

    try {
        // Forzar formato JPEG — @react-pdf/renderer no soporta WebP.
        let fetchUrl = imageUrl.replace(/\.webp(\?|$)/i, ".jpg$1");
        if (fetchUrl === imageUrl && !imageUrl.match(/\.(jpg|jpeg|png)(\?|$)/i)) {
            fetchUrl = imageUrl.replace(/\/upload\//, "/upload/f_jpg,q_auto/");
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64}`;

        return NextResponse.json({ dataUrl });
    } catch (error) {
        console.error("[image-proxy] Error fetching image:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
