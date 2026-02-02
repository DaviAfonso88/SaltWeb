import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Escape HTML para evitar injeção no e-mail
const escapeHTML = (str: string) =>
  str.replace(/[&<>'"]/g, (tag) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }[tag] || tag)
  );

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const servirSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(100),
  phone: z.string().trim().regex(phoneRegex, "Telefone inválido.").max(20),
  ministry: z.string().trim().min(1, "Ministério é obrigatório.").max(100),

  // Honeypot (campo escondido)
  website: z.string().optional(),
});

// Upstash Rate Limit
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 req/min por IP
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    // IP real (Vercel)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    // Rate limit
    const rl = await ratelimit.limit(`servir:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { message: "Muitas tentativas. Aguarde um pouco e tente novamente." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = servirSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessage =
        errors.name?.[0] || errors.phone?.[0] || errors.ministry?.[0];

      return NextResponse.json(
        { message: errorMessage || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, phone, ministry, website } = result.data;

    // Honeypot: bot preenche campo escondido
    if (website && website.trim().length > 0) {
      return NextResponse.json(
        { message: "Inscrição enviada com sucesso!" },
        { status: 200 }
      );
    }

    // Envs SMTP
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const port = Number(process.env.EMAIL_PORT || 587);

    if (!host || !user || !pass) {
      console.error("Config SMTP ausente (EMAIL_HOST/EMAIL_USER/EMAIL_PASS).");
      return NextResponse.json(
        { message: "Falha ao enviar inscrição. Tente novamente mais tarde." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to: "juventudesalt@pibls.com",
      subject: `Novo Voluntário - ${escapeHTML(name)}`,
      html: `
        <p>Um novo voluntário se inscreveu para servir:</p>
        <p><strong>Nome:</strong> ${escapeHTML(name)}</p>
        <p><strong>Telefone:</strong> ${escapeHTML(phone)}</p>
        <p><strong>Ministério:</strong> ${escapeHTML(ministry)}</p>
        <br/>
        <p>Entre em contato com o voluntário para dar andamento.</p>
      `,
    });

    return NextResponse.json(
      { message: "Inscrição enviada com sucesso! Em breve entraremos em contato." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar e-mail de voluntariado:", error);
    return NextResponse.json(
      { message: "Falha ao enviar inscrição." },
      { status: 500 }
    );
  }
}
