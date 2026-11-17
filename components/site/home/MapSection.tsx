import { ButtonLink } from "@/components/site/ButtonLink";
import { CopyButton } from "@/components/site/CopyButton";
import { CHURCH_NAME, CHURCH_URL } from "@/lib/site-info";

const ADDRESS = "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa - MG, 33239-800";
const MAPS_URL = "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG";

const FACTS = [
  { label: "Estacionamento", value: "Gratuito no local" },
  { label: "Acesso", value: "Entrada pela porta lateral" },
  { label: "Acessibilidade", value: "Estrutura adaptada" },
];

/** Mapa e endereço (coluna direita da seção de contato). */
export function MapSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-line bg-[#efede9]">
        <iframe
          src={`${MAPS_URL}&output=embed`}
          title="Mapa: Primeira Igreja Batista em Lagoa Santa"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[300px] w-full border-0"
        />
      </div>
      <div className="flex flex-col gap-[18px] rounded-xl border border-line bg-white p-[clamp(20px,3vw,28px)]">
        <div>
          <p className="font-display text-[19px] font-semibold tracking-[-0.01em]">
            <a href={CHURCH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-purple">
              {CHURCH_NAME}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </p>
          <p className="mt-1 text-text-2">R. Jair Gonçalves Bastos, 64 – Jardim Ipê, Lagoa Santa – MG, 33239-800</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <CopyButton text={ADDRESS} label="Copiar endereço" copiedLabel="Endereço copiado" />
          <ButtonLink href={MAPS_URL} variant="dark" icon="external">
            Abrir no Maps
          </ButtonLink>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-5 gap-y-3 border-t border-[#eeebe6] pt-4 text-sm">
          {FACTS.map((f) => (
            <li key={f.label}>
              <span className="block font-semibold">{f.label}</span>
              <span className="text-text-3">{f.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
