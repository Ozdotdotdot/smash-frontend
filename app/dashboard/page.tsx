"use client";

import Link from "next/link";
import Particles from "@/react-bits/src/content/Backgrounds/Particles/Particles";

// ========================================
// PARTICLES CONFIGURATION - Adjust these values as needed
// ========================================
const PARTICLES_CONFIG = {
  particleCount: 200,           // Number of particles (Count)
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

      <main className="page-shell page-shell--visible relative z-10">
        <header className="flex w-full flex-col gap-6">
          <div className="text-base font-semibold uppercase tracking-[0.3em] text-white">
            s.w
          </div>
          <div className="hero-banner">
            <div className="hero-inner space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-foreground/60">
                Example subpage
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                State dashboards, player data, and quick takeaways.
              </h1>
              <p className="max-w-2xl text-lg text-foreground/75">
                This page lives at <code>/dashboard</code>. Use it like a restaurant site’s
                “menu” page—an extra view linked from the landing experience.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn" href="/">
                  Back to landing
                </Link>
                <a className="btn btn--ghost" href="/#visualization">
                  Jump to chart on landing
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="section__copy space-y-3">
            <h2 className="section__title">What you can show here</h2>
            <p>
              Any content works: a full data dashboard, FAQ, or region-specific deep dive.
              Reuse the same styling as the landing page for consistency.
            </p>
            <p className="text-sm text-foreground/65">
              This keeps navigation simple—landing at <code>/</code>, detail at <code>/dashboard</code>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
