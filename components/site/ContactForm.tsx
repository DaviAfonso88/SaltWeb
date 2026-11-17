"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Field, Honeypot, SubmitRow, TextInput, type Errors } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const local: Errors = {};
    if (!nome.trim()) local.nome = ["Informe seu nome."];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) local.email = ["Informe um e-mail válido."];
    if (!mensagem.trim()) local.mensagem = ["Escreva sua mensagem."];
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;

    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem, website }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSent(true);
        return;
      }
      if (data.fieldErrors) setErrors(data.fieldErrors);
      setFormError(typeof data.error === "string" ? data.error : "Não foi possível enviar agora. Tente novamente em instantes.");
    } catch {
      setFormError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-4 rounded-xl border border-line bg-white p-6">
        <CheckCircle2 className="size-8 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-display text-xl font-semibold">Mensagem enviada!</p>
          <p className="mt-1 text-text-2">Obrigado, {nome.split(" ")[0]}. Em breve a gente responde por e-mail.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-[18px]">
      <Honeypot value={website} onChange={setWebsite} />
      <TextInput name="nome" label="Nome" autoComplete="name" placeholder="Seu nome completo" required value={nome} onChange={setNome} errors={errors.nome} />
      <TextInput name="email" label="E-mail" type="email" autoComplete="email" placeholder="seu.email@exemplo.com" required value={email} onChange={setEmail} errors={errors.email} />
      <Field name="mensagem" label="Mensagem" errors={errors.mensagem}>
        {(a11y) => (
          <Textarea {...a11y} name="mensagem" rows={5} placeholder="Escreva sua mensagem" maxLength={2000} required value={mensagem} onChange={(e) => setMensagem(e.target.value)} className="rounded-lg bg-white px-3.5 py-3 text-[15px] placeholder:text-[#77737e]" />
        )}
      </Field>
      <PrivacyNotice />
      <SubmitRow pending={pending} label="Enviar mensagem" error={formError} inline />
    </form>
  );
}
