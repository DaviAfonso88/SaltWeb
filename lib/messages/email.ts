import nodemailer from "nodemailer";

import { CONTACT_EMAIL } from "@/lib/site-info";

const escapeHtml = (text: string) =>
  text.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c] ?? c);

export type EmailResult = { ok: true } | { ok: false; error: string };

type Mail = { subject: string; html: string; replyTo?: string };

/** Transporte criado sob demanda para o build não depender das variáveis EMAIL_*. */
async function send(mail: Mail): Promise<EmailResult> {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const port = Number(process.env.EMAIL_PORT || 587);
  if (!host || !user || !pass) return { ok: false, error: "Configuração de e-mail ausente." };

  try {
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await transporter.sendMail({ from: user, to: CONTACT_EMAIL, ...mail });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.slice(0, 300) : "Falha ao enviar e-mail." };
  }
}

export function sendContactEmail(data: { nome: string; email: string; mensagem: string }): Promise<EmailResult> {
  const name = escapeHtml(data.nome);
  const email = escapeHtml(data.email);
  return send({
    subject: `Novo Contato do Site - ${name}`,
    replyTo: data.email,
    html: `
      <p>Você recebeu uma nova mensagem do formulário de contato do site:</p>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(data.mensagem).replace(/\n/g, "<br/>")}</p>
      <br/>
      <p><strong>Responder para:</strong> ${email}</p>
    `,
  });
}

export function sendVisitorEmail(data: {
  nome: string;
  whatsapp: string;
  grupo: string;
  bairro?: string;
  comoConheceu?: string;
  convidadoPor?: string;
  interesses: string[];
}): Promise<EmailResult> {
  const row = (label: string, value?: string) => (value ? `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>` : "");
  return send({
    subject: `Novo Visitante - ${escapeHtml(data.nome)}`,
    html: `
      <p>Um visitante deixou o contato pelo site:</p>
      ${row("Nome", data.nome)}
      ${row("WhatsApp", data.whatsapp)}
      ${row("Grupo", data.grupo)}
      ${row("Bairro/cidade", data.bairro)}
      ${row("Como conheceu", data.comoConheceu)}
      ${row("Convidado por", data.convidadoPor)}
      ${row("Gostaria de", data.interesses.join(", "))}
      <br/>
      <p>O cadastro está no painel, em Visitantes. Marque como contatado depois do primeiro contato.</p>
    `,
  });
}

export function sendServirEmail(data: { nome: string; whatsapp: string; ministerio: string }): Promise<EmailResult> {
  return send({
    subject: `Novo Voluntário - ${escapeHtml(data.nome)}`,
    html: `
      <p>Um novo voluntário se inscreveu para servir:</p>
      <p><strong>Nome:</strong> ${escapeHtml(data.nome)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(data.whatsapp)}</p>
      <p><strong>Ministério:</strong> ${escapeHtml(data.ministerio)}</p>
      <br/>
      <p>Entre em contato com o voluntário para dar andamento.</p>
    `,
  });
}
