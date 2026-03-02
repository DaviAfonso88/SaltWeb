import { z } from "zod";

export const registrationSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome completo."),
    idade: z.coerce.number().int().min(10, "Idade invalida.").max(99, "Idade invalida."),
    telefone: z.string().trim().min(10, "Informe um WhatsApp valido."),
    email: z.string().trim().email("E-mail invalido."),
    igreja: z.string().trim().min(2, "Informe a igreja."),
    cidade: z.string().trim().min(2, "Informe a cidade."),
    categoria: z.enum([
      "participante",
      "lideranca",
      "voluntario",
      "pastor_lider_ecossistema",
    ]),
    dupla: z.enum(["nao", "irmao", "conjuge"]),
    paymentPlan: z.enum(["avista", "carne", "credito"]),
    formaPagamento: z.enum(["pix", "dinheiro", "cartao"]).optional(),
    loteTravado: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
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
