"use client";

import { useState } from "react";
import Image from "next/image";
import CardEvento from "../components/CardEvento";
import Modal from "../components/Modal";
import { eventos, Evento } from "./data";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";

export default function Eventos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  const sortedEventos = [...eventos].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

  const handleViewDetails = (event: Evento) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <main>
      <PageHeader
        title="Nossos Eventos"
        subtitle="Participe de nossos encontros e cresça em comunhão e fé."
      />

      <PageSection>
        {sortedEventos.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            Nenhum evento programado no momento. Fique ligado!
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEventos.map((evento) => (
              <CardEvento
                key={evento.id}
                {...evento}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </PageSection>

      {/* Event Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={"Detalhes do Evento"}
      >
        {selectedEvent && (
          <div className="space-y-4">
            {selectedEvent.imagem && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-border/30">
                <Image
                  src={selectedEvent.imagem}
                  alt={selectedEvent.titulo}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              </div>
            )}
            <p className="text-xl font-bold text-foreground">
              {selectedEvent.titulo}
            </p>

            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              <span>
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(selectedEvent.dateISO))}
              </span>
            </div>
            {(selectedEvent.locationName || selectedEvent.address) && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                <span>
                  {selectedEvent.locationName ?? ""}{selectedEvent.locationName && selectedEvent.address ? " — " : ""}
                  {selectedEvent.address ?? ""}
                </span>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed mt-2">
              {selectedEvent.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {selectedEvent.mapsUrl && (
                <a
                  href={selectedEvent.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-border/50 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <MapPin className="h-4 w-4" />
                  Ver no Maps
                </a>
              )}
              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light hover:shadow-glow transition-all duration-300"
                >
                  <ExternalLink className="h-4 w-4" />
                  {selectedEvent.linkLabel ?? "Saiba mais"}
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
