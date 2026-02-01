"use client";
import { useState } from "react";
import Image from "next/image";
import { Smartphone, QrCode, Copy, University, Building, User, ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";
import Step from "../components/Step";

export default function Contribua() {
  const pixKey = "juventudepibls@gmail.com";
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
    <main>
      <PageHeader
        title="Contribua"
        subtitle="Sua generosidade impulsiona a obra da Juventude Salt, permitindo que mais jovens conheçam o amor de Cristo e cresçam na fé."
      />

      {/* Main Contribution Section */}
      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: QR Code and Pix Key */}
          <div className="bg-gradient-to-br from-background/50 to-background/20 p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center order-last lg:order-first">
            <h3 className="text-4xl font-bold mb-8 text-center text-white">
              Contribua com Pix
            </h3>
            <div className="w-64 h-64 bg-white flex items-center justify-center p-2 mb-6 rounded-lg shadow-md">
              <Image
                src="/images/pix.png"
                alt="QR Code Pix"
                width={240}
                height={240}
                className="rounded-md"
              />
            </div>
            <p className="text-muted-foreground text-center mb-6">
              Escaneie o QR Code com o app do seu banco ou copie a chave abaixo.
            </p>
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                readOnly
                value={pixKey}
                className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-center text-muted-foreground pr-12"
              />
              <button
                onClick={() => handleCopy(pixKey, "Chave Pix copiada!")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary-light transition"
              >
                <Copy size={20} />
              </button>
            </div>
            {copyFeedback && (
              <p
                className={`mt-4 text-sm ${
                  copyFeedback.includes("copiada") || copyFeedback.includes("copiados")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {copyFeedback}
              </p>
            )}
          </div>

          {/* Right Column: How to Contribute */}
          <div className="p-8 rounded-lg">
            <h3 className="text-4xl font-bold mb-8 text-foreground">
              Como Funciona
            </h3>
            <div className="space-y-8">
              <Step
                icon={<Smartphone size={24} className="text-primary" />}
                title="Passo 1:"
                description="Abra o aplicativo do seu banco e acesse a área Pix."
              />
              <Step
                icon={<QrCode size={24} className="text-primary" />}
                title="Passo 2:"
                description="Escolha 'Pagar com QR Code' e aponte a câmera para o código ao lado."
              />
              <Step
                icon={<Copy size={24} className="text-primary" />}
                title="Passo 3:"
                description="Ou selecione 'Pix Copia e Cola' e utilize a chave que disponibilizamos."
              />
            </div>
          </div>
        </div>
      </PageSection>

      {/* Bank Details Section */}
      <PageSection>
        <div className="text-center">
          <button
            onClick={() => setShowBankDetails(!showBankDetails)}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors cursor-pointer"
          >
            <University size={20} />
            Ver Dados Bancários para Transferência
            <ChevronDown
              className={`transform transition-transform ${
                showBankDetails ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
        {showBankDetails && (
          <div className="mt-8 max-w-md mx-auto bg-gradient-to-br from-background/50 to-background/20 p-8 rounded-2xl shadow-lg">
            <h4 className="text-3xl font-bold text-center mb-8 text-white">Dados Bancários</h4>
            <div className="space-y-4 text-lg">
              <div className="flex items-center gap-4">
                <Building size={20} className="text-primary" />
                <p><strong>Banco:</strong> {bankDetails.bankName}</p>
              </div>
              <div className="flex items-center gap-4">
                <User size={20} className="text-primary" />
                <p><strong>CPF:</strong> {bankDetails.CPF}</p>
              </div>
              <div className="flex items-center gap-4">
                <User size={20} className="text-primary" />
                <p><strong>Titular:</strong> {bankDetails.accountHolder}</p>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </main>
  );
}
