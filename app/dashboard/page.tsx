"use client";

import { useState } from "react";

import Particles from "@/react-bits/src/content/Backgrounds/Particles/Particles";

// ========================================
// PARTICLES CONFIGURATION - Adjust these values as needed
// ========================================
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
// ========================================

type ViewType = "state" | "tournament";

type StateFilters = {
  region: string;
  timeframe: string;
  game: string;
  characters: string;
};

type TournamentFilters = {
  series: string;
  slugOrUrl: string;
  timeframe: string;
  game: string;
  characters: string;
};

const TIMEFRAME_OPTIONS = [
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
];

const VIEW_ITEMS: Array<{ value: ViewType; label: string }> = [
  { value: "state", label: "State" },
  { value: "tournament", label: "Tournament" },
];

function FilterPanel({
  viewType,
  setViewType,
  stateFilters,
  setStateFilters,
  tournamentFilters,
  setTournamentFilters,
  onApply,
  onReset,
}: {
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
  stateFilters: StateFilters;
  setStateFilters: (value: StateFilters) => void;
  tournamentFilters: TournamentFilters;
  setTournamentFilters: (value: TournamentFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const advancedSection = (value: string, onChange: (value: string) => void) => (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
      <button
        type="button"
        onClick={() => setShowAdvanced((open) => !open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground/80"
        aria-expanded={showAdvanced}
      >
        Advanced
        <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>
          ▸
        </span>
      </button>
      {showAdvanced && (
        <div className="mt-3 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Character Filters</span>
            <input
              type="text"
              placeholder="e.g. Falco, Sheik"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 text-sm">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
          View
        </div>
        <div className="flex w-full gap-2 rounded-full border border-white/10 bg-black/30 p-1 shadow-inner shadow-black/30">
          {VIEW_ITEMS.map((item) => {
            const isActive = viewType === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setViewType(item.value)}
                className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? "bg-white text-black shadow-md shadow-black/30"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Filters
        </div>

        {viewType === "state" && (
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">State</span>
              <input
                type="text"
                placeholder="e.g. Georgia"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
                value={stateFilters.region}
                onChange={(event) =>
                  setStateFilters({ ...stateFilters, region: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Game</span>
              <input
                type="text"
                placeholder="e.g. Melee, Ultimate"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
                value={stateFilters.game}
                onChange={(event) =>
                  setStateFilters({ ...stateFilters, game: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Timeframe</span>
              <select
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground/90 shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
                value={stateFilters.timeframe}
                onChange={(event) =>
                  setStateFilters({ ...stateFilters, timeframe: event.target.value })
                }
              >
                {TIMEFRAME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {advancedSection(stateFilters.characters, (value) =>
              setStateFilters({ ...stateFilters, characters: value })
            )}
          </div>
        )}

        {viewType === "tournament" && (
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Tournament Series (optional)</span>
              <input
                type="text"
                placeholder="e.g. 4o4 Weeklies"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus-border-white/40"
                value={tournamentFilters.series}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, series: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Tournament URL or Slug</span>
              <input
                type="text"
                placeholder="Paste start.gg URL or slug"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover-border-white/25 focus-border-white/40"
                value={tournamentFilters.slugOrUrl}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, slugOrUrl: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Game</span>
              <input
                type="text"
                placeholder="e.g. Melee, Ultimate"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover-border-white/25 focus-border-white/40"
                value={tournamentFilters.game}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, game: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Timeframe</span>
              <select
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground/90 shadow-inner outline-none transition hover-border-white/25 focus-border-white/40"
                value={tournamentFilters.timeframe}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, timeframe: event.target.value })
                }
              >
                {TIMEFRAME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {advancedSection(tournamentFilters.characters, (value) =>
              setTournamentFilters({ ...tournamentFilters, characters: value })
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-md border border-white/20 bg-white/20 px-3 py-2 text-sm font-semibold text-foreground shadow-lg shadow-black/20 transition hover:border-white/30 hover:bg-white/25"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover-border-white/20 hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("state");
  const [stateFilters, setStateFilters] = useState<StateFilters>({
    region: "",
    timeframe: "3m",
    game: "",
    characters: "",
  });
  const [tournamentFilters, setTournamentFilters] = useState<TournamentFilters>({
    series: "",
    slugOrUrl: "",
    timeframe: "3m",
    game: "",
    characters: "",
  });

  const handleApply = () => {
    // Placeholder for wiring into data-fetching logic per view type.
    // eslint-disable-next-line no-console
    console.log("Apply filters", { viewType, stateFilters, tournamentFilters });
  };

  const handleReset = () => {
    setViewType("state");
    setStateFilters({ region: "", timeframe: "3m", game: "", characters: "" });
    setTournamentFilters({ series: "", slugOrUrl: "", timeframe: "3m", game: "", characters: "" });
  };

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
        <aside
          className={`relative hidden shrink-0 flex-col gap-4 border-r border-white/10 bg-black/20 p-4 backdrop-blur transition-all duration-200 md:flex ${
            isDesktopCollapsed ? "w-12" : "w-72"
          }`}
        >
          <button
            type="button"
            aria-label={isDesktopCollapsed ? "Expand filters" : "Collapse filters"}
            onClick={() => setIsDesktopCollapsed((open) => !open)}
            className="absolute -right-3 top-6 flex size-7 items-center justify-center rounded-full border border-white/15 bg-black/70 text-foreground shadow-lg shadow-black/30 backdrop-blur transition hover:bg-black/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`size-4 transition-transform ${isDesktopCollapsed ? "rotate-180" : ""}`}
            >
              <path d="M14 6l-6 6 6 6" />
            </svg>
          </button>

          {!isDesktopCollapsed && (
            <FilterPanel
              viewType={viewType}
              setViewType={setViewType}
              stateFilters={stateFilters}
              setStateFilters={setStateFilters}
              tournamentFilters={tournamentFilters}
              setTournamentFilters={setTournamentFilters}
              onApply={handleApply}
              onReset={handleReset}
            />
          )}
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

        <FilterPanel
          viewType={viewType}
          setViewType={setViewType}
          stateFilters={stateFilters}
          setStateFilters={setStateFilters}
          tournamentFilters={tournamentFilters}
          setTournamentFilters={setTournamentFilters}
          onApply={handleApply}
          onReset={handleReset}
        />
      </aside>
    </div>
  );
}
