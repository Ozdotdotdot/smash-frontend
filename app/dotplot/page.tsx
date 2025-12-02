"use client";

import Particles from "@/components/Particles";

const PARTICLES_CONFIG = {
  particleCount: 400,
  particleSpread: 10,
  speed: 0.1,
  particleBaseSize: 100,
  moveParticlesOnHover: true,
  alphaParticles: false,
  disableRotation: true,
  pixelRatio: 1,
  particleColors: ["#ffffff"],
};

export default function DotplotPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0">
        <Particles
          particleCount={PARTICLES_CONFIG.particleCount}
          particleSpread={PARTICLES_CONFIG.particleSpread}
          speed={PARTICLES_CONFIG.speed}
          particleBaseSize={PARTICLES_CONFIG.particleBaseSize}
          moveParticlesOnHover={PARTICLES_CONFIG.moveParticlesOnHover}
          alphaParticles={PARTICLES_CONFIG.alphaParticles}
          disableRotation={PARTICLES_CONFIG.disableRotation}
          pixelRatio={PARTICLES_CONFIG.pixelRatio}
          particleColors={PARTICLES_CONFIG.particleColors}
          className=""
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="rounded-xl border border-white/10 bg-black/30 px-6 py-8 backdrop-blur">
          <h1 className="text-2xl font-semibold">Dotplot</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Placeholder for the upcoming dotplot view.
          </p>
        </div>
      </div>
    </div>
  );
}
