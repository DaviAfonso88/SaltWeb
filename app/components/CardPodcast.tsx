import React from 'react';
import { Podcast as PodcastIcon } from 'lucide-react';
import { PodcastEpisode } from '../podcast/data';

type CardPodcastProps = {
  episode: PodcastEpisode;
};

const CardPodcast = ({ episode }: CardPodcastProps) => {
  const spotifyEmbedUrl = `https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator&theme=0`;

  return (
    <div className="group bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1">
      <div className="p-6 flex-grow">
        <div className="flex items-start gap-4 mb-3">
          <PodcastIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <h3 className="text-xl font-bold font-heading text-foreground">
            {episode.title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed ml-10">
          {episode.description}
        </p>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <iframe
          className="rounded-xl"
          src={spotifyEmbedUrl}
          width="100%"
          height="152" // Corrected height for a single episode
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default CardPodcast;
