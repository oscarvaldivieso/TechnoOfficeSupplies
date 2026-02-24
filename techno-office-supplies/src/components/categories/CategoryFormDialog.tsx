"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Layers } from "lucide-react";
import type { Category } from "@/types/product";

// Suggested icon names mapped to display labels
const ICON_OPTIONS = [
    { value: "monitor", label: "Monitor" },
    { value: "printer", label: "Impresora" },
    { value: "folder", label: "Folder" },
    { value: "keyboard", label: "Teclado" },
    { value: "mouse-pointer-2", label: "Mouse" },
    { value: "hard-drive", label: "Disco" },
    { value: "wifi", label: "Wi-Fi" },
    { value: "camera", label: "Cámara" },
    { value: "headphones", label: "Audífonos" },
    { value: "cpu", label: "CPU" },
    { value: "tablet", label: "Tablet" },
    { value: "smartphone", label: "Smartphone" },
    { value: "server", label: "Servidor" },
    { value: "lamp-desk", label: "Lámpara" },
    { value: "package", label: "Paquete" },
];

const schema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    icon: z.string().min(1, "Selecciona un ícono"),
});
type FormValues = z.infer<typeof schema>;

interface CategoryFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Category, "id">) => Promise<void>;
    category?: Category | null;
}

export function CategoryFormDialog({ open, onClose, onSubmit, category }: CategoryFormDialogProps) {
    const isEditing = !!category;
    const [selectedIcon, setSelectedIcon] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: { name: "", icon: "" },
    });

    useEffect(() => {
        if (open && category) {
            reset({ name: category.name, icon: category.icon });
            setSelectedIcon(category.icon);
        } else if (open && !category) {
            reset({ name: "", icon: "" });
            setSelectedIcon("");
        }
    }, [open, category, reset]);

    function pickIcon(value: string) {
        setSelectedIcon(value);
        setValue("icon", value, { shouldValidate: true });
    }

    const onValid = async (values: FormValues) => {
        await onSubmit({ name: values.name, icon: values.icon });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Layers className="h-4 w-4 text-violet-400" />
                        {isEditing ? "Editar categoría" : "Nueva categoría"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                        {isEditing
                            ? "Modifica los datos de la categoría."
                            : "Define el nombre y el ícono representativo."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onValid as any)} className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Nombre</Label>
                        <Input
                            {...register("name")}
                            placeholder="Ej: Impresoras, Monitores..."
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    {/* Ícono */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Ícono</Label>
                        <Input
                            {...register("icon")}
                            placeholder="Nombre del ícono de Lucide (ej: monitor)"
                            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 font-mono text-sm"
                            onChange={(e) => {
                                setSelectedIcon(e.target.value);
                                setValue("icon", e.target.value, { shouldValidate: true });
                            }}
                            value={selectedIcon}
                        />
                        {errors.icon && <p className="text-xs text-red-400">{errors.icon.message}</p>}

                        {/* Quick-pick grid */}
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                            {ICON_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => pickIcon(opt.value)}
                                    title={opt.label}
                                    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs transition-colors ${selectedIcon === opt.value
                                            ? "border-violet-500 bg-violet-500/10 text-violet-300"
                                            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
                                        }`}
                                >
                                    <span className="font-mono text-[9px] leading-none truncate w-full text-center">
                                        {opt.value}
                                    </span>
                                    <span className="text-[10px] text-slate-500 truncate w-full text-center">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500">Puedes escribir cualquier nombre de ícono de Lucide.</p>
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                            ) : isEditing ? "Guardar cambios" : "Crear categoría"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
