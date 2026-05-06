import { NextResponse } from "next/server";

import { getStockInfo, initStock } from "@/lib/festa-roca/storage";
import { MONEY_CONTRIBUTION_VALUE } from "@/lib/festa-roca/types";

export async function GET() {
  try {
    await initStock();
    const stockInfo = await getStockInfo();

    return NextResponse.json({
      ...stockInfo,
      moneyValue: MONEY_CONTRIBUTION_VALUE,
    });
  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    return NextResponse.json(
      { message: "Não foi possível carregar o estoque." },
      { status: 500 }
    );
  }
}