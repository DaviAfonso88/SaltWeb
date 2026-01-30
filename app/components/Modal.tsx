"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // foca o botão de fechar por padrão
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      // devolve o foco para quem abriu o modal
      previouslyFocusedRef.current?.focus?.();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    if (!modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="relative bg-card rounded-lg shadow-xl border border-card-light w-full max-w-3xl p-6 md:p-8 transform transition-all duration-300 scale-100 opacity-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:cursor-pointer"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>
        {title && (
          <h2
            id="modal-title"
            className="text-2xl font-bold font-heading text-foreground mb-4 pr-10"
          >
            {title}
          </h2>
        )}
        <div id="modal-description" className="text-foreground text-sm md:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}
