import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatDateTime } from "@/lib/format";

/** PDF em paisagem com cabeçalho e data de geração. Roda no Node (Route Handler). */
export function toPdf(params: { title: string; subtitle?: string; columns: string[]; rows: string[][] }): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const margin = 36;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(params.title, margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  const meta = [params.subtitle, `Gerado em ${formatDateTime(new Date())}`].filter(Boolean).join(" · ");
  doc.text(meta, margin, 56);

  autoTable(doc, {
    head: [params.columns],
    body: params.rows,
    startY: 70,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [146, 52, 140], textColor: 255 },
    alternateRowStyles: { fillColor: [246, 245, 242] },
    didDrawPage: () => {
      const page = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Página ${page}`, doc.internal.pageSize.getWidth() - margin, doc.internal.pageSize.getHeight() - 16, { align: "right" });
    },
  });

  return new Uint8Array(doc.output("arraybuffer"));
}
