import type { Metadata } from "next";
import { connection } from "next/server";

import { DevocionalList } from "@/components/site/DevocionalList";
import { PageHeader } from "@/components/site/SectionHeading";
import { getPublishedDevotionals } from "@/lib/devotionals/queries";

export const metadata: Metadata = {
  title: "Devocionais",
  description: "Inspiração para sua caminhada com Deus: devocionais da Juventude Salt.",
};

export default async function DevocionalPage() {
  await connection();
  const items = await getPublishedDevotionals();

  return (
    <>
      <PageHeader eyebrow="Devocional" title="Devocionais" description="Inspiração diária para sua caminhada com Deus." />
      <DevocionalList items={items} />
    </>
  );
}
