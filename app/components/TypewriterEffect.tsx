"use client";

import React, { useEffect, useState } from "react";

interface TypewriterEffectProps {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDelay?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDelay = 1200,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // DIGITANDO
    if (!isDeleting && index < text.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, typingSpeed);
    }

    // PAUSA APÓS DIGITAR
    if (!isDeleting && index === text.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDelay);
    }

    // APAGANDO
    if (isDeleting && index > 0) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
        setIndex(index - 1);
      }, deletingSpeed);
    }

    // PAUSA APÓS APAGAR E REINICIA
    if (isDeleting && index === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, pauseDelay);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, typingSpeed, deletingSpeed, pauseDelay]);

  return (
    <span className="inline-block min-w-[18ch] ">
      {displayText}
      <span className="ml-1 animate-pulse">|</span>
    </span>
  );
};

export default TypewriterEffect;
