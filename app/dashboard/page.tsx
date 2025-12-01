"use client";

import { useState } from "react";

import Particles from "@/react-bits/src/content/Backgrounds/Particles/Particles";

// ========================================
// PARTICLES CONFIGURATION - Adjust these values as needed
// ========================================
const PARTICLES_CONFIG = {
  particleCount: 400,           // Number of particles (Count)
  particleSpread: 10,            // How spread out the particles are (Spread)
  speed: 0.1,                    // Animation speed (Speed)
  particleBaseSize: 100,         // Base size of particles (Base Size)
  moveParticlesOnHover: true,    // Mouse interaction enabled (Mouse Interaction)
  alphaParticles: false,         // Particle transparency off (Particle Transparency)
  disableRotation: true,         // Rotation disabled (Disable Rotation)
  pixelRatio: 1,                 // Pixel ratio (Pixel Ratio)
  particleColors: ['#ffffff'],   // Particle colors (hex values)
};
// ========================================

export default function DashboardPage() {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Particles Background */}
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

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col gap-4 border-r border-white/10 bg-black/20 p-4 backdrop-blur md:flex">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Filters
          </div>
          <div className="flex-1 rounded-lg border border-dashed border-white/15 bg-white/5" />
        </aside>

        <div className="flex-1 p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              type="button"
              onClick={() => setIsMobilePanelOpen(true)}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground shadow-lg shadow-black/20 backdrop-blur transition hover:bg-white/15"
              aria-expanded={isMobilePanelOpen}
              aria-controls="mobile-filter-panel"
            >
              Filters
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-6 backdrop-blur">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Use the side panel to house data filter controls.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          isMobilePanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobilePanelOpen(false)}
      />

      <aside
        id="mobile-filter-panel"
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col gap-4 border-r border-white/10 bg-black/90 p-4 backdrop-blur transition-transform duration-200 md:hidden ${
          isMobilePanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Filters
          </div>
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen(false)}
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-white/15"
          >
            Close
          </button>
        </div>

        {/* Add sliders, buttons, dropdowns, etc. for analytics filters inside this container. */}
        <div className="flex-1 rounded-lg border border-dashed border-white/15 bg-white/5" />
      </aside>
    </div>
  );
}
