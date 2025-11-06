"use client";

import * as React from "react";
import { Button } from "@dougust/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@dougust/ui/components/dialog";
import { TipoDiariaDto } from "@dougust/clients";

export type TipoDiariaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipos: TipoDiariaDto[];
  selectedTipoDiariaId: string;
  onSelectedTipoDiariaIdChange: (id: string) => void;
  onConfirm: () => void;
  isSaving?: boolean;
  title?: string;
};

export function TipoDiariaDialog(props: TipoDiariaDialogProps) {
  const {
    open,
    onOpenChange,
    tipos,
    selectedTipoDiariaId,
    onSelectedTipoDiariaIdChange,
    onConfirm,
    isSaving = false,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title ?? "Alterar tipo da diária"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm text-muted-foreground">Tipo de diária</label>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={selectedTipoDiariaId}
            onChange={(e) => onSelectedTipoDiariaIdChange(e.target.value)}
          >
            <option value="" disabled>
              Selecione um tipo
            </option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onConfirm} disabled={!selectedTipoDiariaId || isSaving}>
            {isSaving ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TipoDiariaDialog;
