import React from 'react';

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <section className="py-24 text-center bg-card/20 bg-gradient-to-b from-[#18181b] via-[#1f1f23] to-[#27272a]">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold font-heading text-foreground animate-fade-in">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default PageHeader;
