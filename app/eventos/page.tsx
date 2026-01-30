"use client";

import { useState } from "react";
import CardEvento from "../components/CardEvento";
import Modal from "../components/Modal";
import { eventos, Evento } from "./data";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";
import EventDetails from "../components/EventDetails";

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
        title="Detalhes do Evento"
      >
        {selectedEvent && <EventDetails event={selectedEvent} />}
      </Modal>
    </main>
  );
}
