"use client";

import { useState } from "react";
import CardEvento from "../components/CardEvento";
import Modal from "../components/Modal";
import { eventos, Evento } from "./data";
import { CalendarDays, MapPin } from "lucide-react";
import PageHeader from '../components/PageHeader';
import PageSection from '../components/PageSection';

export default function Eventos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

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
        {eventos.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            Nenhum evento programado no momento. Fique ligado!
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento, i) => (
              <CardEvento
                key={i}
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
              <img
                src={selectedEvent.imagem}
                alt={selectedEvent.titulo}
                className="w-full h-auto rounded-lg object-cover"
              />
            )}
            <p className="text-xl font-bold text-foreground">
              {selectedEvent.titulo}
            </p>
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              <span>
                {selectedEvent.data} de {selectedEvent.mes}
              </span>
            </div>
            {selectedEvent.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                <span>{selectedEvent.location}</span>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed mt-2">
              {selectedEvent.description}
            </p>
            {selectedEvent.link && (
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center text-primary hover:text-primary-light font-semibold transition-colors duration-200"
              ></a>
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}
