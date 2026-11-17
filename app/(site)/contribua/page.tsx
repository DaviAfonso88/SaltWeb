import { ArrowUpRight, Building2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { CopyButton } from "@/components/site/CopyButton";
import { PageHeader } from "@/components/site/SectionHeading";
import { Tag } from "@/components/site/Tag";
import { PIX_BENEFICIARY, PIX_IMAGE, PIX_KEY, PIX_KEY_DISPLAY } from "@/lib/pix";
import { CHURCH_GIVING_URL, CHURCH_NAME } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Contribua",
  description: "Contribua com a Juventude Salt pelo Pix da Primeira Igreja Batista em Lagoa Santa.",
};

const STEPS = [
  { n: 1, title: "Abra o app do seu banco", text: "Acesse a área Pix." },
  { n: 2, title: "Escolha “Pagar com QR Code”", text: "Aponte a câmera para o código ao lado." },
  { n: 3, title: "Ou use a chave Pix", text: "Copie a chave e cole no app do banco." },
];

export default function ContribuaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contribua"
        title="Sua generosidade move a missão."
        description={`Sua contribuição, feita pela chave Pix da ${CHURCH_NAME}, impulsiona a obra da Juventude Salt, permitindo que mais jovens conheçam o amor de Cristo e cresçam na fé.`}
      />

      <section aria-label="Formas de contribuir" className="pb-[clamp(64px,8vw,112px)]">
        <div className="container-site grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <article aria-labelledby="pix-titulo" className="flex flex-col gap-6 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
            <div className="flex items-center justify-between gap-4">
              <h2 id="pix-titulo" className="font-display text-2xl font-semibold tracking-[-0.015em]">
                Contribua com Pix
              </h2>
              <Tag tone="success">Instantâneo</Tag>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="shrink-0 rounded-[10px] border border-line bg-white p-4">
                <Image src={PIX_IMAGE} alt={`QR Code Pix da ${CHURCH_NAME}`} width={222} height={219} className="h-auto w-44" />
              </div>
              <p className="min-w-[180px] flex-1 text-text-2">Escaneie o QR Code com o app do seu banco ou copie a chave abaixo.</p>
            </div>
            <div className="flex flex-col gap-2">
              <p id="pix-chave-rotulo" className="text-sm font-semibold">
                Chave Pix (CNPJ)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={PIX_KEY_DISPLAY}
                  aria-labelledby="pix-chave-rotulo"
                  className="h-12 min-w-0 flex-1 rounded-lg border border-line-strong bg-sand px-3.5 text-[15px] font-medium text-foreground"
                />
                <CopyButton text={PIX_KEY} label="Copiar" copiedLabel="Copiada" variant="primary" className="h-12" />
              </div>
              <p className="text-sm text-text-3">Beneficiário: {PIX_BENEFICIARY}</p>
            </div>
          </article>

          <div className="flex flex-col gap-6">
            <article aria-labelledby="como-titulo" className="rounded-xl bg-sand p-[clamp(24px,3.5vw,40px)]">
              <h2 id="como-titulo" className="mb-2 font-display text-2xl font-semibold tracking-[-0.015em]">
                Como funciona
              </h2>
              <ol>
                {STEPS.map((s) => (
                  <li key={s.n} className="flex gap-4 border-b border-line py-[18px] last:border-b-0 last:pb-0">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold text-purple"
                      aria-hidden
                    >
                      {s.n}
                    </span>
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="mt-0.5 text-[15px] text-text-2">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-line bg-white p-[clamp(20px,3vw,28px)]">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sand">
                <Building2 className="size-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-[1_1_240px]">
                <p className="font-semibold">Contribuição para a igreja</p>
                <p className="text-sm text-text-3">A Juventude Salt é o ministério jovem da {CHURCH_NAME}. Dízimos e ofertas também são feitos pela mesma chave.</p>
              </div>
              <a
                href={CHURCH_GIVING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-purple hover:text-purple-dark"
              >
                Ver em pibls.com <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

