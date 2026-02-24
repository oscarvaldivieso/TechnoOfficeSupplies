"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    productName: string;
    isDeleting: boolean;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

export function DeleteConfirmDialog({
    open,
    productName,
    isDeleting,
    onConfirm,
    onCancel,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-400" />
                        Eliminar producto
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 pt-1">
                        ¿Estás seguro de que quieres eliminar{" "}
                        <span className="text-white font-medium">"{productName}"</span>?
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-700 hover:bg-red-600"
                    >
                        {isDeleting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</>
                        ) : (
                            "Sí, eliminar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
