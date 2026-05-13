export type Devocional = {
  titulo: string;
  link: string;
  mes: string;
};

export async function getDevocionais(): Promise<Devocional[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/daviafonso88/juventudesalt-dados/main/devocional.json",
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.devocionais;
  } catch (error) {
    console.error("Failed to fetch devocionais:", error);
    return [];
  }
}
