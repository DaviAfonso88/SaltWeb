import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/imagens/eventos/**" }],
  },
  async redirects() {
    return [
      { source: "/acampa-salt", destination: "/eventos/acampa-salt-2026", permanent: true },
      { source: "/festa-na-roca", destination: "/eventos", permanent: true },
      { source: "/projeto-missionario", destination: "/eventos", permanent: true },
    ];
  },
};

export default nextConfig;
