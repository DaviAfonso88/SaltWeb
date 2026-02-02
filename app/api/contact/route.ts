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

// Schema com honeypot
const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(100),
  email: z.string().trim().email("E-mail inválido.").max(150),
  message: z
    .string()
    .trim()
    .min(1, "Mensagem é obrigatória.")
    .max(2000, "Mensagem muito longa."),
  website: z.string().optional(), // honeypot
});

// Upstash Rate Limit
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 req por minuto por IP
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    // IP real (Vercel / Proxy)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    // Rate limit
    const rl = await ratelimit.limit(`contact:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { message: "Muitas tentativas. Aguarde um pouco e tente novamente." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessage =
        errors.name?.[0] || errors.email?.[0] || errors.message?.[0];

      return NextResponse.json(
        { message: errorMessage || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { name, email, message, website } = result.data;

    // Honeypot: bot preenche campo escondido
    if (website && website.trim().length > 0) {
      return NextResponse.json(
        { message: "Mensagem enviada com sucesso!" },
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
        { message: "Falha ao enviar mensagem. Tente novamente mais tarde." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // fix correto
      auth: { user, pass },
    });

    const safeName = escapeHTML(name);
    const safeEmail = escapeHTML(email);
    const safeMessage = escapeHTML(message).replace(/\n/g, "<br/>");

    await transporter.sendMail({
      from: user,
      to: "juventudesalt@pibls.com",
      replyTo: email, // muito bom para responder direto
      subject: `Novo Contato do Site - ${safeName}`,
      html: `
        <p>Você recebeu uma nova mensagem do formulário de contato do site:</p>
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${safeMessage}</p>
        <br/>
        <p><strong>Responder para:</strong> ${safeEmail}</p>
      `,
    });

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json(
      { message: "Falha ao enviar mensagem." },
      { status: 500 }
    );
  }
}
