"use client";

import { useState } from "react";
import BotaoPrimario from "./BotaoPrimario";
import SectionLabel from "./SectionLabel";
import { Handshake, Loader2 } from "lucide-react";

const ministries = [
  "Louvor",
  "Multimídia",
  "Sonoplastia",
  "Acolhimento",
  "Infantil",
  "Transmissão",
];

export default function ServirForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ministry, setMinistry] = useState("");
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

    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; 

    if (!name.trim()) {
      setFeedbackMessage("Por favor, digite seu nome completo.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }
    if (!phoneRegex.test(phone)) {
      setFeedbackMessage("Por favor, digite um telefone válido.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }
    if (!ministry) {
      setFeedbackMessage("Por favor, selecione um ministério.");
      setFeedbackMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/servir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, ministry }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackMessage(
          data.message || "Inscrição enviada com sucesso! Em breve entraremos em contato."
        );
        setFeedbackMessageType("success");
        setName("");
        setPhone("");
        setMinistry("");
      } else {
        setFeedbackMessage(data.message || "Falha ao enviar inscrição.");
        setFeedbackMessageType("error");
      }
    } catch (error) {
      console.error("Erro de rede ao enviar formulário de voluntariado:", error);
      setFeedbackMessage("Erro de rede. Tente novamente mais tarde.");
      setFeedbackMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="servir" className="section-spacing bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container-elegant text-center relative z-10">
        <div className="mb-16 animate-fade-in-up">
          <SectionLabel>
            Oportunidade
          </SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-6">
            Quero <span className="text-gradient">Servir</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Faça parte da nossa equipe! Preencha o formulário e entraremos em contato.
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
              Nome Completo
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
              htmlFor="phone"
              className="block text-left text-sm font-medium text-foreground mb-2"
            >
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm"
              placeholder="(DD) 9XXXX-XXXX"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="ministry"
              className="block text-left text-sm font-medium text-foreground mb-2"
            >
              Ministério de Interesse
            </label>
            <select
              id="ministry"
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm"
              required
            >
              <option value="" disabled>
                Selecione um ministério
              </option>
              {ministries.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <BotaoPrimario className="w-full text-primary hover:text-white hover:bg-primary hover:cursor-pointer">
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Handshake className="mr-2" size={20} />
            )}
            {loading ? "Enviando..." : "Quero Servir"}
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
