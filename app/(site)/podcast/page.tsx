"use client";

import { episodios } from "./data";
import { Headphones, Mic, PlayCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function PodcastPage() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <main className="bg-background">
      {/* Custom Header */}
      <section className="relative py-32 text-center bg-card/20 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-10 text-primary/10 animate-float" style={{ animationDelay: "0s" }}>
          <Mic className="w-8 h-8" />
        </div>
        <div className="absolute bottom-1/4 right-10 text-primary/10 animate-float" style={{ animationDelay: "2s" }}>
          <Headphones className="w-8 h-8" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div 
            ref={headerRef}
            className={`transition-all duration-1000 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground">
              Salt <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Talks</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Conversas que dão sabor à fé.
            </p>

            {/* Decorative line */}
            <div className="w-24 h-1 mx-auto mt-8 bg-gradient-to-r from-primary via-primary-light to-primary rounded-full" />

            {/* Platform badges */}
            <div className="flex justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
                <PlayCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Spotify</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50">
                <Headphones className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Apple Podcasts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Grid */}
      <section className="py-24 bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {episodios.length === 0 ? (
            <div className="text-center py-20">
              <Headphones className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">
                Nenhum episódio disponível no momento. Fique ligado para novidades!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
              {episodios.map((episode, index) => (
                <CardPodcast key={index} episode={episode} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

import { PodcastEpisode } from "./data";
import { Podcast } from "lucide-react";

function CardPodcast({ episode, index }: { episode: PodcastEpisode; index: number }) {
  const spotifyEmbedUrl = `https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator&theme=0`;
  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <article
      ref={cardRef}
      className={`group relative bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-glow hover:shadow-primary/10 hover:-translate-y-2 hover-glow border border-border/50 hover:border-primary/30 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-br-2xl" />

      <div className="relative z-10 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <Podcast className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors duration-300 flex-1">
            {episode.title}
          </h2>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-6 ml-2">
          {episode.description}
        </p>

        <div className="relative rounded-xl overflow-hidden border border-border/30 group-hover:border-primary/20 transition-colors duration-300">
          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}