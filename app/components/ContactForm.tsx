"use client";

import { useState } from "react";
import BotaoPrimario from "./BotaoPrimario";
import SectionLabel from "./SectionLabel";
import { Mail, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

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
        body: JSON.stringify({
          name,
          email,
          message: userMessage,
          website, // honeypot
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackMessage(data.message || "Mensagem enviada com sucesso!");
        setFeedbackMessageType("success");
        setName("");
        setEmail("");
        setUserMessage("");
        setWebsite(""); // reset honeypot
      } else {
        setFeedbackMessage(data.message || "Falha ao enviar mensagem.");
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
    <section
      id="contato"
      className="section-spacing bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container-elegant text-center relative z-10">
        <div className="mb-16 animate-fade-in-up">
          <SectionLabel>Conecte-se</SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-6">
            Entre em <span className="text-gradient">Contato</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Se você busca crescer na fé, criar amizades verdadeiras e viver algo
            maior, a Juventude Salt é o seu lugar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto p-10 rounded-2xl glass-effect border border-border/50 shadow-2xl animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
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
              className="w-full px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm"
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
              className="w-full px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm"
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
              className="w-full px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm resize-none"
              placeholder="Sua mensagem..."
              required
            ></textarea>
          </div>

          {/* Honeypot (anti-bot) */}
          <div className="hidden">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          <BotaoPrimario className="w-full text-primary hover:text-white hover:bg-primary hover:cursor-pointer">
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
