"use client";

import { useState } from "react";
import Image from "next/image";
import { Smartphone, QrCode, Copy } from "lucide-react";
import BotaoPrimario from "../components/BotaoPrimario";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";

export default function Contribua() {
  const pixKey = "juventudepibls@gmail.com";
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopyFeedback("Chave Pix copiada!");
      setTimeout(() => setCopyFeedback(""), 3000);
    } catch (err) {
      setCopyFeedback("Falha ao copiar a chave Pix.");
      setTimeout(() => setCopyFeedback(""), 3000);
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <main>
      <PageHeader
        title="Contribua"
        subtitle="Sua generosidade faz a diferença na obra da Juventude Salt. Seja parte do que Deus está fazendo em nossa juventude. Toda contribuição é uma semente de fé e amor."
      />
      <PageSection>
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left Column: Pix Tutorial Steps */}
          <div className="w-full md:w-1/2 p-8 rounded-lg shadow-lg bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b]">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Como Contribuir via Pix
            </h3>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Smartphone size={24} className="text-[#92348c] " />
                </div>
                <p className="text-lg text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Passo 1:
                  </span>{" "}
                  Abra o aplicativo do seu banco.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <QrCode size={24} className="text-[#92348c] " />
                </div>
                <p className="text-lg text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Passo 2:
                  </span>{" "}
                  Escolha a opção Pix e escaneie o QR Code.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Copy size={24} className="text-[#92348c] " />
                </div>
                <p className="text-lg text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Passo 3:
                  </span>{" "}
                  Ou copie a chave Pix abaixo e cole no seu banco.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code Area */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b] p-8 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Escanear para Contribuir
            </h3>
            <div className="w-64 h-64 bg-white flex items-center justify-center p-2 mb-4 rounded-lg">
              <Image
                src="/images/pix.png"
                alt="QR Code Pix"
                width={200}
                height={200}
                className="rounded-md"
              />
            </div>
            <p className="text-muted-foreground text-center mb-6">
              Escaneie o QR Code acima diretamente pelo aplicativo do seu banco.
            </p>

            {/* Copy Pix Key Button */}
            <div className="flex flex-col items-center">
              <BotaoPrimario
                onClick={handleCopyPix}
                className=" hover:cursor-pointer"
              >
                <Copy size={20} className="mr-2 " />
                Copiar Chave Pix
              </BotaoPrimario>
              {copyFeedback && (
                <p
                  className={`mt-3 text-sm ${
                    copyFeedback.includes("copiada")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {copyFeedback}
                </p>
              )}
            </div>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
