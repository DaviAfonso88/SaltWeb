import React from 'react';
import { Podcast as PodcastIcon } from 'lucide-react';
import { PodcastEpisode } from '../podcast/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CardPodcastProps = {
  episode: PodcastEpisode;
};

const CardPodcast = ({ episode }: CardPodcastProps) => {
  const spotifyEmbedUrl = `https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator&theme=0`;

  return (
    <Card className="group bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start gap-4">
          <PodcastIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <CardTitle className="text-xl font-bold font-heading text-foreground">
            {episode.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm leading-relaxed ml-10">
          {episode.description}
        </p>
      </CardContent>
      <div className="px-6 pb-6 mt-auto">
        <iframe
          className="rounded-xl"
          src={spotifyEmbedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </Card>
  );
};

export default CardPodcast;
