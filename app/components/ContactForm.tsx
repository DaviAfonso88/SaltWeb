"use client";

import { useState } from "react";
import BotaoPrimario from "./BotaoPrimario";
import { Mail, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackMessageType, setFeedbackMessageType] = useState<
    "success" | "error" | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMessage("");
    setFeedbackMessageType(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setFeedbackMessage("Por favor, digite seu nome.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setFeedbackMessage("Por favor, digite um e-mail válido.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }
    if (!userMessage.trim()) {
      setFeedbackMessage("Por favor, digite sua mensagem.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackMessage(
          data.feedbackMessage || "Mensagem enviada com sucesso!"
        );
        setFeedbackMessageType("success");
        setName("");
        setEmail("");
        setUserMessage("");
      } else {
        setFeedbackMessage(data.feedbackMessage || "Falha ao enviar mensagem.");
        setFeedbackMessageType("error");
      }
    } catch (error) {
      console.error("Erro de rede ao enviar formulário:", error);
      setFeedbackMessage("Erro de rede. Tente novamente mais tarde.");
      setFeedbackMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#1f1f23] ">
      <div className="container mx-auto px-6 text-center  ">
        <h2 className="text-4xl font-bold font-heading text-foreground mb-4">
          Entre em Contato
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Se você busca crescer na fé, criar amizades verdadeiras e viver algo
          maior, a Juventude Salt é o seu lugar.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-8 rounded-lg bg-zinc-800 shadow-lg  shadow-[#92348c]"
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-left text-sm font-medium text-foreground mb-2"
            >
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-zinc-900 border border-muted-foreground/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-left text-sm font-medium text-foreground mb-2"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-zinc-900 border border-muted-foreground/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-left text-sm font-medium text-foreground mb-2"
            >
              Mensagem
            </label>
            <textarea
              id="message"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={loading}
              rows={5}
              className="w-full px-4 py-2 rounded-md bg-zinc-900 border border-muted-foreground/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              placeholder="Sua mensagem..."
              required
            ></textarea>
          </div>

          <BotaoPrimario
            type="submit"
            disabled={loading}
            className="w-full text-primary hover:text-white hover:bg-primary hover:cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Mail className="mr-2" size={20} />
            )}
            {loading ? "Enviando..." : "Enviar"}
          </BotaoPrimario>

          {feedbackMessage && (
            <p
              className={`mt-4 text-center text-sm ${
                feedbackMessageType === "success"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {feedbackMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
