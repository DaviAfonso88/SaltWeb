import { episodios } from "./data";
import CardPodcast from "../components/CardPodcast";

export default function PodcastPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-24 text-center bg-card/20 bg-gradient-to-b from-[#18181b] via-[#1f1f23] to-[#27272a]">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold font-heading text-foreground animate-fade-in">
            Salt Talks
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Conversas que dão sabor à fé.
          </p>
        </div>
      </header>

      {/* Episodes Grid */}
      <main className="py-24 bg-gradient-to-b from-[#27272a] via-[#1f1f23] to-[#18181b]">
        <div className="container mx-auto px-6">
          {episodios.length === 0 ? (
            <p className="text-center text-muted-foreground text-lg">
              Nenhum episódio disponível no momento. Fique ligado para
              novidades!
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
              {episodios.map((episode, index) => (
                <CardPodcast key={index} episode={episode} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
