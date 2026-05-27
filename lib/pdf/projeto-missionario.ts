import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ParticipationRecord } from "@/lib/projeto-missionario/types";

const parcialLabel: Record<string, string> = {
  sextaNoite: "Sexta noite",
  sabadoManha: "Sáb manhã",
  sabadoTarde: "Sáb tarde",
  sabadoNoite: "Sáb noite",
  domingoTarde: "Dom tarde",
};

export function generateProjetoMissionarioPDF(records: ParticipationRecord[]): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("LISTA DE PARTICIPANTES — PROJETO MISSIONÁRIO SALT", pageWidth / 2, 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${records.length} participantes · Gerado em ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    17,
    { align: "center" },
  );

  doc.setTextColor(0);

  const body = records.map((item, index) => {
    const selectedParciais = (Object.entries(item.parcial) as [string, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => parcialLabel[k]);

    const participacao = item.tempoIntegral
      ? "Integral"
      : selectedParciais.join(", ");

    return [
      String(index + 1),
      item.nome,
      item.telefone,
      participacao,
      item.interesseCamisa ? "Sim" : "Não",
      item.status === "confirmado" ? "Confirmado" : "Pendente",
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [["Nº", "Nome", "WhatsApp", "Participação", "Camisa", "Status"]],
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 60 },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 45 },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 25, halign: "center" },
    },
    bodyStyles: { textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 15, right: 15 },
    theme: "striped",
  });

  doc.save(`projeto-missionario-participantes-${new Date().toISOString().split("T")[0]}.pdf`);
}
