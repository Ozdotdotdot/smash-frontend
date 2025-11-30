"use client";

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
  return (
    <div className="relative min-h-screen bg-background">
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
    </div>
  );
}
