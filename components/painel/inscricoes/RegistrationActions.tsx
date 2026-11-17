"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteRegistration, setInstallmentPaid, setRegistrationStatus } from "@/lib/registrations/actions";

type Status = "pending" | "confirmed" | "cancelled";
type Installment = { rotulo: string; valorCentavos: number; pago: boolean; pagoEm?: string };

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

export function RegistrationActions({
  id,
  name,
  status,
  installments,
  plan,
  canManage,
}: {
  id: string;
  name: string;
  status: Status;
  installments: Installment[];
  /** Plano de pagamento (define o título da seção de parcelas). */
  plan?: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: Status) {
    startTransition(async () => {
      const result = await setRegistrationStatus(id, next);
      if (result.ok) {
        toast.success(result.message ?? "Situação atualizada.");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  function toggleInstallment(index: number, paid: boolean) {
    startTransition(async () => {
      const result = await setInstallmentPaid(id, index, paid);
      if (result.ok) {
        toast.success(result.message ?? "Parcela atualizada.");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  return (
    <div className="grid gap-6">
      <section aria-labelledby="situacao-titulo" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 id="situacao-titulo" className="font-display text-lg font-semibold">
          Situação
        </h2>
        <div role="group" aria-labelledby="situacao-titulo" className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((o) => (
            <Button
              key={o.value}
              type="button"
              variant={status === o.value ? "default" : "outline"}
              aria-pressed={status === o.value}
              disabled={!canManage || pending}
              onClick={() => changeStatus(o.value)}
              className="min-h-11 rounded-full"
            >
              {o.label}
            </Button>
          ))}
        </div>
      </section>

      {installments.length ? (
        <section aria-labelledby="parcelas-titulo" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="parcelas-titulo" className="font-display text-lg font-semibold">
            {plan === "credito" ? "Cartão de crédito" : "Carnê"}
          </h2>
          <ul className="grid gap-2">
            {installments.map((p, i) => {
              const cid = `parcela-${i}`;
              return (
                <li key={`${i}-${p.rotulo}`} className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-3">
                  <Checkbox
                    id={cid}
                    checked={p.pago}
                    disabled={!canManage || pending}
                    onCheckedChange={(checked) => toggleInstallment(i, checked === true)}
                  />
                  <Label htmlFor={cid} className="flex flex-1 flex-wrap items-center justify-between gap-2 text-sm font-normal">
                    <span className="capitalize">{p.rotulo}</span>
                    <span className="text-text-2">
                      {formatCurrency(p.valorCentavos)}
                      {p.pago && p.pagoEm ? ` · paga em ${formatDate(p.pagoEm)}` : ""}
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {canManage ? (
        <div>
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="min-h-11 rounded-full text-destructive">
                <Trash2 aria-hidden /> Excluir inscrição
              </Button>
            }
            title="Excluir inscrição?"
            description={`A inscrição de ${name} será excluída definitivamente. Para só tirar da contagem, use a situação “Cancelada”.`}
            confirmLabel="Excluir"
            onConfirm={async () => {
              const result = await deleteRegistration(id);
              if (result.ok) router.push("/painel/inscricoes");
              return result;
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
