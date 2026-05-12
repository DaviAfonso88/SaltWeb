import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RegistrationRecord } from "@/lib/festa-roca/types";

export function generateFestaNaRocaPDF(records: RegistrationRecord[]): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("LISTA DE PARTICIPANTES — FESTA NA ROÇA", pageWidth / 2, 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${records.length} participantes · Gerado em ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    17,
    { align: "center" },
  );

  doc.setTextColor(0);

  const body = records.map((item, index) => [
    String(index + 1),
    item.nome,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [["Nº", "Nome"]],
    body,
    styles: { fontSize: 12, cellPadding: 5 },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 12,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: "auto" },
    },
    bodyStyles: { textColor: [0, 0, 0] },
    margin: { left: 15, right: 15 },
    theme: "plain",
  });

  doc.save(`festa-na-roca-participantes-${new Date().toISOString().split("T")[0]}.pdf`);
}