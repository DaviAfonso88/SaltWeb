import { episodios } from './data';
import CardPodcast from '../components/CardPodcast';
import PageHeader from '../components/PageHeader';
import PageSection from '../components/PageSection';

export default function PodcastPage() {
  return (
    <main>
      <PageHeader
        title="Salt Talks"
        subtitle="Conversas que dão sabor à fé."
      />
      <PageSection>
        {episodios.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            Nenhum episódio disponível no momento. Fique ligado para novidades!
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
            {episodios.map((episode, index) => (
              <CardPodcast key={index} episode={episode} />
            ))}
          </div>
        )}
      </PageSection>
    </main>
  );
}
