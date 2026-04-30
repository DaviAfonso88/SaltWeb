"use client";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <section className="relative py-32 text-center bg-card/20 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground animate-fade-in-up">
          {title}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {subtitle}
        </p>

        {/* Decorative line */}
        <div className="w-24 h-1 mx-auto mt-8 bg-gradient-to-r from-primary via-primary-light to-primary rounded-full animate-fade-in-up" style={{ animationDelay: "0.4s" }} />
      </div>
    </section>
  );
};

export default PageHeader;