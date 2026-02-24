/**
 * Sube una imagen a Cloudinary usando un upload preset sin firmar.
 * Requiere en .env.local:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
 */
export async function uploadToCloudinary(
    file: File,
    folder = "technooffice/products"
): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary no configurado. Revisa tu .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) {
        throw new Error("Error al subir la imagen a Cloudinary");
    }

    const data = await res.json();
    return data.secure_url as string;
}
