import BotaoPrimario from "../BotaoPrimario";
import TypewriterEffect from "../TypewriterEffect";
import Image from "next/image"; // Import Image component

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern Background - Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background animate-gradient-xy" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container-elegant py-32 flex flex-col md:flex-row items-center justify-between gap-16">
        {/* Left Section: Content */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-heading text-foreground tracking-tight leading-[1.1]">
              Juventude <span className="text-gradient">Salt</span>
            </h1>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-light">
              <TypewriterEffect text="Seja luz, seja Salt" />
            </h2>
          </div>

          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto md:mx-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Uma juventude que vive a fé com propósito, amizade e impacto,
            conectando pessoas e transformando vidas.
          </p>

          <div className="flex justify-center md:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <BotaoPrimario
              href="/eventos"
              className="text-base md:text-lg"
            >
              Nossos eventos
            </BotaoPrimario>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <Image
              src="/images/SALT SIMBOLO DEGRADE.png"
              alt="Juventude Salt Logo"
              width={400}
              height={400}
              className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
