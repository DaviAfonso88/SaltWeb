"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="left-0 top-0 h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 rounded-none p-4 sm:left-[50%] sm:top-[50%] sm:h-auto sm:w-[92vw] sm:max-w-5xl lg:sm:max-w-6xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:p-8 max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        <DialogDescription asChild>
          <div>{children}</div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
