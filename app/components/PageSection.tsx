import React from "react";

type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
};

const PageSection = ({ children, className = "" }: PageSectionProps) => {
  return (
    <section
      className={`py-24 bg-gradient-to-b from-[#27272a] via-[#1f1f23] to-[#18181b] ${className}`}
    >
      <div className="container mx-auto px-6">{children}</div>
    </section>
  );
};

export default PageSection;