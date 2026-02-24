"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2, Upload, X, ImageOff, Tag } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Brand } from "@/types/product";

const schema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    logoUrl: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface BrandFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Brand, "id">) => Promise<void>;
    brand?: Brand | null;
}

export function BrandFormDialog({ open, onClose, onSubmit, brand }: BrandFormDialogProps) {
    const isEditing = !!brand;
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: { name: "", logoUrl: "" },
    });

    useEffect(() => {
        if (open && brand) {
            reset({ name: brand.name, logoUrl: brand.logoUrl ?? "" });
            setPreviewUrl(brand.logoUrl ?? "");
            setSelectedFile(null);
        } else if (open && !brand) {
            reset({ name: "", logoUrl: "" });
            setPreviewUrl("");
            setSelectedFile(null);
        }
    }, [open, brand, reset]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setValue("logoUrl", "__pending__", { shouldValidate: false });
    }

    const onValid = async (values: FormValues) => {
        let logoUrl = values.logoUrl === "__pending__" ? "" : (values.logoUrl ?? "");

        if (selectedFile) {
            setUploading(true);
            try {
                logoUrl = await uploadToCloudinary(selectedFile, "technooffice/brands");
            } catch {
                alert("Error al subir el logo. Verifica tu configuración de Cloudinary.");
                setUploading(false);
                return;
            } finally {
                setUploading(false);
            }
        }

        await onSubmit({ name: values.name, logoUrl });
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Tag className="h-4 w-4 text-blue-400" />
                        {isEditing ? "Editar marca" : "Nueva marca"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                        {isEditing
                            ? "Modifica los datos de la marca seleccionada."
                            : "Agrega una nueva marca al catálogo de productos."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onValid as any)} className="space-y-5">
                    {/* Logo */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Logo</Label>
                        <div className="flex items-center gap-4">
                            {/* Preview circle */}
                            <div className="h-16 w-16 shrink-0 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <div className="relative h-full w-full group">
                                        <Image
                                            src={previewUrl}
                                            alt="logo preview"
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviewUrl("");
                                                setValue("logoUrl", "");
                                                setSelectedFile(null);
                                            }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <ImageOff className="h-6 w-6 text-slate-600" />
                                )}
                            </div>

                            <div className="flex-1 space-y-1">
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
                                        <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Subiendo...</>
                                    ) : (
                                        <><Upload className="mr-2 h-3 w-3" />Subir logo</>
                                    )}
                                </Button>
                                <p className="text-xs text-slate-500">PNG, SVG o WEBP. Fondo transparente ideal.</p>
                            </div>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Nombre de la marca</Label>
                        <Input
                            {...register("name")}
                            placeholder="Ej: HP, Canon, Epson..."
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                            ) : isEditing ? "Guardar cambios" : "Crear marca"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
