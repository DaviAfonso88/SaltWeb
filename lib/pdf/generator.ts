import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RegistrationRecord } from "@/lib/acampa/types";

const duplaLabel: Record<string, string> = {
  nao: "Não",
  irmao: "Irmão",
  conjuge: "Cônjuge",
};

export function generateInscriptionsPDF(records: RegistrationRecord[]): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 12;

  doc.setFillColor(102, 16, 242);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("LISTA DE INSCRITOS — ACAMPA SALT 2026", pageWidth / 2, 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const totalPessoas = records.reduce((sum, r) => sum + (r.quantidadeConjuges > 0 ? r.quantidadeConjuges : 1), 0);
  doc.text(
    `${records.length} inscrições · ${totalPessoas} pessoas · Gerado em ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    17,
    { align: "center" },
  );

  doc.setTextColor(0);
  y = 28;

  const sorted = [...records].sort((a, b) => {
    const loteOrder = ["primeiro", "segundo", "terceiro", "quarto", "quinto", "ultimo"];
    const ai = loteOrder.indexOf(a.lote);
    const bi = loteOrder.indexOf(b.lote);
    if (ai !== bi) return ai - bi;
    return a.numeroInscricao.localeCompare(b.numeroInscricao);
  });

  const body = sorted.map((item, index) => {
    const duplaText =
      item.dupla === "nao"
        ? "—"
        : `${duplaLabel[item.dupla] ?? item.dupla}${(item.nomeDupla ?? "").trim() ? ` c/ ${item.nomeDupla}` : ""} (×${item.quantidadeConjuges})`;

    const nomeExibir =
      item.dupla === "nao"
        ? item.nome
        : `${item.nome} + ${item.nomeDupla ?? ""}`;

    return [
      String(index + 1),
      item.numeroInscricao,
      nomeExibir,
      duplaText,
      item.igreja,
      item.cidade,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Nº",
        "Inscrição",
        "Participante(s)",
        "Tipo de Dupla",
        "Igreja",
        "Cidade",
      ],
    ],
    body,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [70, 10, 180],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 28, halign: "center" },
      2: { cellWidth: 65 },
      3: { cellWidth: 55 },
      4: { cellWidth: 55 },
    },
    bodyStyles: { textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: margin, right: margin },
    theme: "striped",
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  for (let i = 2; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i);
    doc.setFillColor(102, 16, 242);
    doc.rect(0, 0, pageWidth, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("ACAMPA SALT 2026", margin, 5.5);
    doc.text(`Página ${i} de ${doc.getNumberOfPages()}`, pageWidth - margin, 5.5, { align: "right" });
    doc.setTextColor(0);
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  const footerY = Math.min(finalY + 8, pageHeight - 6);
  doc.text(
    `Acampa SALT 2026 · ${records.length} inscrições · ${totalPessoas} pessoas`,
    pageWidth / 2,
    footerY,
    { align: "center" },
  );
  doc.setTextColor(0);

  doc.save(`acampa-salt-inscricoes-${new Date().toISOString().split("T")[0]}.pdf`);
}