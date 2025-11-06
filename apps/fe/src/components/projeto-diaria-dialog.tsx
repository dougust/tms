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
import { ProjetoDto } from "@dougust/clients";

export type ProjetoDiariaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetos: ProjetoDto[];
  selectedProjetoId: string;
  onSelectedProjetoIdChange: (id: string) => void;
  onConfirm: () => void;
  isSaving?: boolean;
};

export function ProjetoDiariaDialog(props: ProjetoDiariaDialogProps) {
  const {
    open,
    onOpenChange,
    projetos,
    selectedProjetoId,
    onSelectedProjetoIdChange,
    onConfirm,
    isSaving = false,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar projeto da diária</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="text-sm text-muted-foreground">Projeto</label>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={selectedProjetoId}
            onChange={(e) => onSelectedProjetoIdChange(e.target.value)}
          >
            <option value="" disabled>
              Selecione um projeto
            </option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onConfirm} disabled={!selectedProjetoId || isSaving}>
            {isSaving ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjetoDiariaDialog;
