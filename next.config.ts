import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Deshabilitar el router cache del cliente para páginas dinámicas
    // Esto hace que cada navegación re-fetche el Server Component desde el server
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
