"use client";

import * as React from "react";
import { useMemo } from "react";
import { Button } from "@dougust/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@dougust/ui/components/dialog";
import { LookupDto, useLookupsControllerFindAll } from "@dougust/clients";

export type TipoDiariaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Lista opcional de tipos (lookups) a ser utilizada. Se não for fornecida,
   * o componente buscará automaticamente os lookups do grupo 'TipoDiaria'.
   */
  tipos?: LookupDto[];
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

  // Carrega todos os lookups e filtra pelo grupo 'TipoDiaria' quando a prop 'tipos' não é fornecida
  const {
    data: lookups = [],
    isLoading: isLookupsLoading,
    isError: isLookupsError,
  } = useLookupsControllerFindAll<LookupDto[]>();

  const tiposDiaria = useMemo<LookupDto[]>(() => {
    if (tipos && tipos.length) return tipos;
    return (lookups || []).filter((l) => l.grupo === "TipoDiaria");
  }, [tipos, lookups]);

  const isInternalLoading = !tipos && isLookupsLoading;
  const isInternalError = !tipos && isLookupsError;

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
            disabled={isInternalLoading || isInternalError}
          >
            <option value="" disabled>
              {isInternalLoading
                ? "Carregando tipos..."
                : isInternalError
                ? "Erro ao carregar tipos"
                : "Selecione um tipo"}
            </option>
            {tiposDiaria.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          {isInternalError && (
            <span className="text-xs text-red-600">Não foi possível carregar os tipos de diária.</span>
          )}
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
