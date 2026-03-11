import { z } from "zod";

export const registrationSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome completo."),
    nomeDupla: z.string().trim().optional(),
    idade: z.number().int().min(10, "Idade invalida.").max(99, "Idade invalida."),
    telefone: z.string().trim().min(10, "Informe um WhatsApp valido."),
    email: z.string().trim().email("E-mail invalido."),
    igreja: z.string().trim().min(2, "Informe a igreja."),
    cidade: z.string().trim().min(2, "Informe a cidade."),
    categoria: z.literal("participante"),
    dupla: z.enum(["nao", "irmao", "conjuge"]),
    quantidadeConjuges: z.number().int().min(0, "Quantidade invalida.").max(20, "Quantidade invalida."),
    paymentPlan: z.enum(["avista", "carne", "credito"]),
    formaPagamento: z.enum(["pix", "dinheiro", "cartao"]).optional(),
    loteTravado: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if ((data.dupla === "conjuge" || data.dupla === "irmao") && data.quantidadeConjuges < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["quantidadeConjuges"],
        message: "Inscrição em dupla exige no mínimo 2 pessoas.",
      });
    }

    if (data.dupla === "nao" && data.quantidadeConjuges !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantidadeConjuges"],
        message: "Quantidade so pode ser informada quando houver dupla.",
      });
    }

    if (data.dupla !== "nao") {
      const nome = data.nomeDupla?.trim() ?? "";
      if (nome.length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["nomeDupla"],
          message: `Informe o nome do ${data.dupla === "irmao" ? "irmao" : "conjuge"}.`,
        });
      }
    } else if ((data.nomeDupla?.trim() ?? "") !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["nomeDupla"],
        message: "Nome da dupla so pode ser informado quando houver dupla.",
      });
    }

    if (data.paymentPlan === "avista" && !data.formaPagamento) {
      ctx.addIssue({
        code: "custom",
        path: ["formaPagamento"],
        message: "Selecione a forma de pagamento a vista.",
      });
    }

    if (data.paymentPlan === "credito" && data.formaPagamento !== "cartao") {
      ctx.addIssue({
        code: "custom",
        path: ["formaPagamento"],
        message: "No plano de credito, a forma de pagamento deve ser cartao de credito.",
      });
    }
  });
