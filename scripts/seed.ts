/**
 * Seed idempotente: papéis padrão, evento Acampa SALT 2026 e os 24 devocionais atuais.
 * Uso: npm run db:seed   (requer DATABASE_URL em .env.local)
 */
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_ROLES } from "../lib/auth/permissions";
import { getDb } from "../lib/db";
import { devotionals, eventImages, events, roles } from "../lib/db/schema";

const MONTHS: Record<string, number> = { JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6, JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12 };
const DEVOTIONAL_YEAR = 2026;

async function seedRoles() {
  const db = getDb();
  for (const role of DEFAULT_ROLES) {
    const [existing] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, role.name)).limit(1);
    if (existing) continue;
    await db.insert(roles).values({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: true,
    });
    console.log(`  papel criado: ${role.name}`);
  }
}

async function seedEvent() {
  const db = getDb();
  const slug = "acampa-salt-2026";
  const [existing] = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
  if (existing) {
    console.log("  evento já existe: Acampa SALT 2026");
    return;
  }

  const imagePath = path.join(process.cwd(), "public", "images", "acampa.jpeg");
  const data = fs.readFileSync(imagePath);
  const [image] = await db
    .insert(eventImages)
    .values({ data, mime: "image/jpeg", size: data.length })
    .returning({ id: eventImages.id });

  const lote = (rotulo: string, valorCentavos: number, validoAte: string) => ({ rotulo, valorCentavos, validoAte });

  await db.insert(events).values({
    slug,
    title: "Acampa SALT 2026",
    summary: "O acampamento da Juventude SALT.",
    description:
      "O primeiro lote do Acampa SALT está disponível com valor promocional de R$ 285 para inscrições em fevereiro. Importante: este link é apenas para registrarmos o seu interesse em adquirir o primeiro lote — não se trata da compra ou confirmação da inscrição. Entraremos em contato posteriormente com as orientações para pagamento e confirmação.",
    startsAt: new Date("2026-07-17T14:00:00-03:00"),
    locationName: "Gomes de Rezende",
    locationAddress: "R. Raimundo, R. Cel. Ovídio Guerra, 97, Lagoa Santa - MG, 33400-000",
    locationMapUrl: "https://maps.app.goo.gl/jAwkbUvKQGb1GqfK7",
    imageId: image.id,
    imageAlt: "Jovens da SALT durante o Acampa SALT",
    category: "Acampamento",
    featured: true,
    publication: "published",
    formModel: "acampamento",
    formConfig: {
      lotes: [
        lote("Primeiro Lote", 28500, "2026-02-28"),
        lote("Segundo Lote", 29500, "2026-03-31"),
        lote("Terceiro Lote", 30500, "2026-04-30"),
        lote("Quarto Lote", 31500, "2026-05-31"),
        lote("Quinto Lote", 32500, "2026-06-30"),
        lote("Último Lote", 33500, "2026-07-31"),
      ],
      descontoDuplaPct: 15,
      descontoPixPct: 5,
      descontoDinheiroPct: 10,
      parcelasCarne: 6,
      permitirCredito: true,
    },
    registrationOpen: false,
  });
  console.log("  evento criado: Acampa SALT 2026");
}

async function seedDevotionals() {
  const db = getDb();
  const existing = await db.select({ id: devotionals.id }).from(devotionals).limit(1);
  if (existing.length) {
    console.log("  devocionais já existem");
    return;
  }

  const file = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "scripts", "data", "devocionais.json"), "utf8"),
  ) as { devocionais: { titulo: string; link: string; mes: string }[] };

  const base = Date.now();
  const rows = file.devocionais.map((d, i) => {
    const month = MONTHS[d.mes.toUpperCase()];
    if (!month) throw new Error(`Mês desconhecido: ${d.mes}`);
    return {
      title: d.titulo,
      referenceMonth: `${DEVOTIONAL_YEAR}-${String(month).padStart(2, "0")}-01`,
      url: d.link,
      published: true,
      // Mantém a ordem do arquivo: o último do arquivo é o "mais recente".
      publishedAt: new Date(base - (file.devocionais.length - i) * 60_000),
    };
  });
  await db.insert(devotionals).values(rows);
  console.log(`  ${rows.length} devocionais criados`);
}

async function main() {
  console.log("Seed…");
  await seedRoles();
  await seedEvent();
  await seedDevotionals();
  console.log("Pronto.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
