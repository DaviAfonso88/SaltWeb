"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Smartphone,
  QrCode,
  Copy,
  University,
  Building,
  User,
  ChevronDown,
  Heart,
  HandHeart,
  Wallet,
  Check,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { JUVENTUDE_PIX_IMAGE, JUVENTUDE_PIX_KEY } from "@/lib/pix";

export default function Contribua() {
  const pixKey = JUVENTUDE_PIX_KEY;
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);

  const bankDetails = {
    bankName: "Neon Pagamentos",
    CPF: "***.668.706-**",
    accountHolder: "Thiago Silva Candido Oliveira",
  };

  const handleCopy = async (textToCopy: string, feedbackMessage: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback(feedbackMessage);
      setTimeout(() => setCopyFeedback(""), 3000);
    } catch (err) {
      setCopyFeedback("Falha ao copiar.");
      setTimeout(() => setCopyFeedback(""), 3000);
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <main className="bg-background">
      {/* Custom Header */}
      <section className="relative py-32 text-center bg-card/20 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />

        {/* Floating hearts */}
        <div className="absolute top-1/4 left-10 text-primary/10 animate-float" style={{ animationDelay: "0s" }}>
          <Heart className="w-8 h-8" />
        </div>
        <div className="absolute bottom-1/4 right-10 text-primary/10 animate-float" style={{ animationDelay: "2s" }}>
          <HandHeart className="w-8 h-8" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground">
            Contribua
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua generosidade impulsiona a obra da Juventude Salt, permitindo que mais jovens conheçam o amor de Cristo e cresçam na fé.
          </p>
          <div className="w-24 h-1 mx-auto mt-8 bg-gradient-to-r from-primary via-primary-light to-primary rounded-full" />
        </div>
      </section>

      {/* Main Contribution Section */}
      <section className="py-24 bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: QR Code and Pix Key */}
            <PixCard 
              pixKey={pixKey} 
              handleCopy={handleCopy} 
              copyFeedback={copyFeedback}
            />

            {/* Right Column: How to Contribute */}
            <HowToContribute />
          </div>
        </div>
      </section>

      {/* Bank Details Section */}
      <BankDetailsToggle 
        showBankDetails={showBankDetails} 
        setShowBankDetails={setShowBankDetails}
        bankDetails={bankDetails}
      />
    </main>
  );
}

function PixCard({ pixKey, handleCopy, copyFeedback }: { 
  pixKey: string; 
  handleCopy: (text: string, msg: string) => void;
  copyFeedback: string;
}) {
  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div 
      ref={cardRef}
      className={`relative bg-card/50 p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-border/50 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/20 rounded-br-2xl" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-6">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-3xl font-bold mb-8 text-center text-foreground">
          Contribua com Pix
        </h3>
        
        <div className="relative w-64 h-64 bg-white flex items-center justify-center p-3 mb-6 rounded-xl shadow-lg border border-border/30 group hover:shadow-xl transition-shadow duration-300">
          <Image
            src={JUVENTUDE_PIX_IMAGE}
            alt="QR Code Pix"
            width={240}
            height={240}
            className="rounded-lg"
          />
          <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300" />
        </div>
        
        <p className="text-muted-foreground text-center mb-6">
          Escaneie o QR Code com o app do seu banco ou copie a chave abaixo.
        </p>
        
        <div className="relative w-full max-w-sm group">
          <input
            type="text"
            readOnly
            value={pixKey}
            className="w-full bg-card/50 border border-border/50 rounded-xl p-4 text-center text-muted-foreground pr-14 focus:border-primary transition-colors duration-300"
          />
          <button
            onClick={() => handleCopy(pixKey, "Chave Pix copiada!")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-light transition-all duration-300 hover-lift"
          >
            <Copy size={20} />
          </button>
        </div>
        
        {copyFeedback && (
          <p className={`mt-4 text-sm font-medium flex items-center gap-2 ${
            copyFeedback.includes("copiada") ||
            copyFeedback.includes("copiados")
              ? "text-green-500"
              : "text-red-500"
          }`}>
            {copyFeedback.includes("copiada") && <Check className="w-4 h-4" />}
            {copyFeedback}
          </p>
        )}
      </div>
    </div>
  );
}

function HowToContribute() {
  const { ref: contentRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  const steps = [
    {
      icon: <Smartphone size={24} />,
      title: "Passo 1:",
      description: "Abra o aplicativo do seu banco e acesso a área Pix.",
    },
    {
      icon: <QrCode size={24} />,
      title: "Passo 2:",
      description: "Escolha 'Pagar com QR Code' e aponte a câmera.",
    },
    {
      icon: <Copy size={24} />,
      title: "Passo 3:",
      description: "Ou utilize a chave Pix que disponibilizamos.",
    },
  ];

  return (
    <div 
      ref={contentRef}
      className={`p-8 rounded-2xl transition-all duration-1000 delay-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
      }`}
    >
      <h3 className="text-3xl font-bold mb-8 text-foreground">
        Como Funciona
      </h3>
      
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div 
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 group"
          >
            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
              <span className="text-primary">{step.icon}</span>
            </div>
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-foreground">{step.title}</span>{" "}
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankDetailsToggle({ 
  showBankDetails, 
  setShowBankDetails,
  bankDetails 
}: { 
  showBankDetails: boolean; 
  setShowBankDetails: (show: boolean) => void;
  bankDetails: { bankName: string; CPF: string; accountHolder: string };
}) {

  return (
    <section className="py-24 bg-gradient-to-b from-card via-background to-card relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-20 left-10 w-24 h-24 border border-primary/10 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <button
            onClick={() => setShowBankDetails(!showBankDetails)}
            type="button"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 border border-border/50 text-primary font-semibold hover:border-primary hover:text-primary-light hover:bg-card transition-all duration-300 cursor-pointer hover-lift"
          >
            <University size={20} />
            Ver Dados Bancários para Transferência
            <ChevronDown
              className={`transform transition-transform duration-300 ${
                showBankDetails ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showBankDetails && (
          <div 
            className="mt-12 max-w-lg mx-auto bg-card/50 p-8 rounded-2xl shadow-lg border border-border/50"
          >
            <h4 className="text-2xl font-bold text-center mb-8 text-foreground">
              Dados Bancários
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building size={20} className="text-primary" />
                </div>
                <p className="text-lg">
                  <strong className="text-foreground mr-2">Banco:</strong>
                  <span className="text-muted-foreground">{bankDetails.bankName}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User size={20} className="text-primary" />
                </div>
                <p className="text-lg">
                  <strong className="text-foreground mr-2">CPF:</strong>
                  <span className="text-muted-foreground">{bankDetails.CPF}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User size={20} className="text-primary" />
                </div>
                <p className="text-lg">
                  <strong className="text-foreground mr-2">Titular:</strong>
                  <span className="text-muted-foreground">{bankDetails.accountHolder}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}