import BotaoPrimario from "../BotaoPrimario";
import TypewriterEffect from "../TypewriterEffect";
import Image from "next/image"; // Import Image component

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Modern Background - Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#92348c]/10 to-[#18181b] animate-gradient-xy" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />{" "}
        {/* Subtle pattern overlay */}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-12 animate-fade-in">
        {/* Left Section: Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            Juventude Salt
          </h1>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-light mb-8 drop-shadow ">
            <TypewriterEffect text="Seja luz, seja Salt" />
          </h2>

          <p className="mt-6 text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto md:mx-0 mb-10">
            Uma juventude que vive a fé com propósito, amizade e impacto,
            conectando pessoas e transformando vidas.
          </p>

          <div className="mt-10 flex justify-center md:justify-start">
            <BotaoPrimario
              href="/eventos"
              className="text-lg px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Nossos eventos
            </BotaoPrimario>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <Image
            src="/images/SALT SIMBOLO DEGRADE.png"
            alt="Juventude Salt Logo"
            width={400}
            height={400}
            className="w-40 h-40
    sm:w-52 sm:h-52
    md:w-64 md:h-64
    lg:w-80 lg:h-80
    rounded-fulls
    transform hover:scale-105
    transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
}
