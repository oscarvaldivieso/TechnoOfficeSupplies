"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X, ImageOff } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Product, ProductFormData, Brand, Category } from "@/types/product";

// ─── Validación Zod ───────────────────────────────────────────────────────────
const schema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    sku: z.string().min(1, "El SKU es requerido"),
    brand_id: z.string().min(1, "Selecciona una marca"),
    category_id: z.string().min(1, "Selecciona una categoría"),
    image: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => Promise<void>;
    brands: Brand[];
    categories: Category[];
    product?: Product | null; // null = crear, Product = editar
}

export function ProductFormDialog({
    open,
    onClose,
    onSubmit,
    brands,
    categories,
    product,
}: ProductFormDialogProps) {
    const isEditing = !!product;
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: "", description: "", sku: "",
            brand_id: "", category_id: "", image: "",
        },
    });

    // Precargar valores al editar
    useEffect(() => {
        if (open && product) {
            reset({
                name: product.name,
                description: product.description,
                sku: product.sku,
                brand_id: product.brand_id,
                category_id: product.category_id,
                image: product.image ?? "",
            });
            setPreviewUrl(product.image ?? "");
        } else if (open && !product) {
            reset({ name: "", description: "", sku: "", brand_id: "", category_id: "", image: "" });
            setPreviewUrl("");
            setSelectedFile(null);
        }
    }, [open, product, reset]);

    // Solo guarda el archivo localmente y muestra preview – NO sube a Cloudinary todavía
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        // Marca el campo como pendiente de subida
        setValue("image", "__pending__", { shouldValidate: false });
    }

    const onValid: SubmitHandler<FormValues> = async (values) => {
        let imageUrl = values.image === "__pending__" ? "" : (values.image ?? "");

        // Si hay un archivo nuevo pendiente, subirlo ahora a Cloudinary
        if (selectedFile) {
            setUploading(true);
            try {
                imageUrl = await uploadToCloudinary(selectedFile);
            } catch {
                alert("Error al subir la imagen. Verifica tu configuración de Cloudinary.");
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        await onSubmit({ ...values, image: imageUrl });
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {isEditing ? "Editar producto" : "Nuevo producto"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                        {isEditing
                            ? "Modifica los detalles del producto seleccionado."
                            : "Completa la información para agregar un nuevo producto al catálogo."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onValid as any)} className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Nombre</Label>
                        <Input
                            {...register("name")}
                            placeholder="Nombre del producto"
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">SKU</Label>
                        <Input
                            {...register("sku")}
                            placeholder="Ej: TOS-001"
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-mono"
                        />
                        {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
                    </div>

                    {/* Marca y Categoría */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-slate-300">Marca</Label>
                            <Select
                                value={watch("brand_id")}
                                onValueChange={(v) => setValue("brand_id", v, { shouldValidate: true })}
                            >
                                <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white">
                                    <SelectValue placeholder="Seleccionar marca" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {brands.map((b) => (
                                        <SelectItem key={b.id} value={b.id!} className="text-white focus:bg-slate-700">
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.brand_id && <p className="text-xs text-red-400">{errors.brand_id.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-slate-300">Categoría</Label>
                            <Select
                                value={watch("category_id")}
                                onValueChange={(v) => setValue("category_id", v, { shouldValidate: true })}
                            >
                                <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white">
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id!} className="text-white focus:bg-slate-700">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-xs text-red-400">{errors.category_id.message}</p>}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Descripción</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Descripción del producto..."
                            rows={3}
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
                    </div>

                    {/* Imagen */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Imagen</Label>
                        <div className="flex gap-3 items-start">
                            {/* Preview */}
                            <div className="h-20 w-20 shrink-0 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <div className="relative h-full w-full">
                                        <Image src={previewUrl} alt="preview" fill className="object-contain p-1" unoptimized />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewUrl(""); setValue("image", ""); setSelectedFile(null); }}
                                            className="absolute top-0.5 right-0.5 rounded-full bg-red-600 p-0.5"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <ImageOff className="h-6 w-6 text-slate-600" />
                                )}
                            </div>
                            {/* Botón de upload */}
                            <div className="flex-1 space-y-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading}
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    {uploading ? (
                                        <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Subiendo...</>
                                    ) : (
                                        <><Upload className="mr-2 h-3 w-3" /> Subir imagen</>
                                    )}
                                </Button>
                                <p className="text-xs text-slate-500">JPG, PNG o WEBP. Máx 5MB.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}
                            className="text-slate-400 hover:text-white hover:bg-slate-800">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                            ) : isEditing ? "Guardar cambios" : "Crear producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
