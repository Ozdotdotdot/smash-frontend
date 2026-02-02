"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Info } from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import Header from "@/components/Header";
import Particles from "@/components/Particles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ToggleLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 5H7a4 4 0 0 0 0 8h14a4 4 0 0 0 0-8Z" />
      <circle cx="8" cy="9" r="3" />
    </svg>
  );
}

function ToggleRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 5h14a4 4 0 0 1 0 8H3a4 4 0 0 1 0-8Z" />
      <circle cx="16" cy="9" r="3" />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    </svg>
  );
}

function SquareCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

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
  characters: string;
  filterStates: string;
  minEntrants: string;
  maxEntrants: string;
  minMaxEventEntrants: string;
  largeEventThreshold: string;
  minLargeEventShare: string;
  startAfter: string;
};

type TournamentFilters = {
  state: string;
  series: string;
  slugOrUrl: string;
  timeframe: string;
  characters: string;
  filterStates: string;
  minEntrants: string;
  maxEntrants: string;
  minMaxEventEntrants: string;
  largeEventThreshold: string;
  minLargeEventShare: string;
  startAfter: string;
};

type PlayerPoint = {
  player_id?: number;
  gamer_tag: string;
  weighted_win_rate: number;
  opponent_strength: number;
  home_state?: string;
};
const playerKey = (row: PlayerPoint) => String(row.player_id ?? row.gamer_tag ?? "");

const TIMEFRAME_OPTIONS = [
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
];

const TIMEFRAME_TO_MONTHS: Record<string, number> = {
  "30d": 1,
  "3m": 3,
};

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
  allowMultiSeries,
  setAllowMultiSeries,
  forceRefresh,
  setForceRefresh,
  seriesOptions,
  selectedSeriesKey,
  onSelectSeries,
  hideOutliers,
  setHideOutliers,
}: {
  viewType: ViewType;
  setViewType: (value: ViewType) => void;
  stateFilters: StateFilters;
  setStateFilters: (value: StateFilters) => void;
  tournamentFilters: TournamentFilters;
  setTournamentFilters: (value: TournamentFilters) => void;
  onApply: () => void;
  onReset: () => void;
  allowMultiSeries: boolean;
  setAllowMultiSeries: Dispatch<SetStateAction<boolean>>;
  forceRefresh: boolean;
  setForceRefresh: Dispatch<SetStateAction<boolean>>;
  seriesOptions: Array<{ key: string; label: string }>;
  selectedSeriesKey: string | null;
  onSelectSeries: (key: string) => void;
  hideOutliers: boolean;
  setHideOutliers: (value: boolean) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const labelWithTooltip = (label: string, tooltip: string) => (
    <div className="flex items-center gap-2">
      <span className="text-foreground/70">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            aria-label={`${label} details`}
            className="flex items-center justify-center text-foreground/80 transition hover:text-foreground"
          >
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-2 border-[#1E2129] bg-[#08090C] text-white shadow-black/50"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const advancedSection = (
    filters: StateFilters | TournamentFilters,
    setter: (value: any) => void,
    hideOutliers: boolean,
    setHideOutliers: (value: boolean) => void,
  ) => (
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
            {labelWithTooltip(
              "Filter State(s)",
              "Comma-separated list of state codes to keep (e.g., GA, FL).",
            )}
            <input
              type="text"
              placeholder="GA, FL"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.filterStates}
              onChange={(event) =>
                setter({ ...filters, filterStates: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Character Filters",
              "Comma-separated characters to focus on (matches player mains or target character terms)."
            )}
            <input
              type="text"
              placeholder="Falco, Sheik"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.characters}
              onChange={(event) => setter({ ...filters, characters: event.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Min Entrants (avg)",
              "Require players whose average event size meets or exceeds this entrant count."
            )}
            <input
              type="number"
              min={0}
              placeholder="32"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.minEntrants}
              onChange={(event) => setter({ ...filters, minEntrants: event.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Max Entrants (avg)",
              "Require players whose average event size is at or below this entrant count."
            )}
            <input
              type="number"
              min={0}
              placeholder="128"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.maxEntrants}
              onChange={(event) => setter({ ...filters, maxEntrants: event.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Min Largest Event Entrants",
              "Keep players whose single biggest event had at least this many entrants."
            )}
            <input
              type="number"
              min={0}
              placeholder="64"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.minMaxEventEntrants}
              onChange={(event) =>
                setter({ ...filters, minMaxEventEntrants: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Large Event Threshold",
              "Defines what entrant count qualifies as a large event for the share filter."
            )}
            <input
              type="number"
              min={0}
              placeholder="32"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.largeEventThreshold}
              onChange={(event) =>
                setter({ ...filters, largeEventThreshold: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Min Large Event Share",
              "Require at least this fraction of a player's events to meet the large-event threshold (0-1)."
            )}
            <input
              type="number"
              min={0}
              max={1}
              step="0.01"
              placeholder="0.33"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
              value={filters.minLargeEventShare}
              onChange={(event) =>
                setter({ ...filters, minLargeEventShare: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {labelWithTooltip(
              "Start After",
              "Drop players whose most recent event started on or after this date (MM/DD/YYYY via picker)."
            )}
            <input
              type="date"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus-border-white/40"
              value={filters.startAfter}
              onChange={(event) => setter({ ...filters, startAfter: event.target.value })}
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
                placeholder="GA"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
                value={stateFilters.region}
                onChange={(event) =>
                  setStateFilters({ ...stateFilters, region: event.target.value })
                }
              />
            </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Timeframe</span>
            <select
              className="rounded-md border border-white/20 bg-[#0E0F15] px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/30 focus:border-white/40"
              style={{ backgroundColor: "#0E0F15" }}
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

          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Hide outliers</span>
              <span className="text-[11px] text-foreground/60">Suppress far-right strength tail.</span>
            </div>
            <button
              type="button"
              onClick={() => setHideOutliers(!hideOutliers)}
              aria-pressed={hideOutliers}
              className="rounded-md border border-white/10 bg-black/50 p-2 text-foreground transition hover:border-white/20 hover:text-white"
            >
              {hideOutliers ? (
                <SquareCheckIcon className="h-4 w-4" />
              ) : (
                <SquareIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {advancedSection(stateFilters, setStateFilters, hideOutliers, setHideOutliers)}

            <div className="flex gap-2">
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
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:border-white/20 hover:text-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {viewType === "tournament" && (
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">State</span>
              <input
                type="text"
                placeholder="GA"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40"
                value={tournamentFilters.state}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, state: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground/70">Tournament Series (optional)</span>
              <input
                type="text"
                placeholder="4o4, Guildhouse"
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/25 focus-border-white/40"
                value={tournamentFilters.series}
                onChange={(event) =>
                  setTournamentFilters({ ...tournamentFilters, series: event.target.value })
                }
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-foreground/60">
                <span>Allow multiple series?</span>
                <button
                  type="button"
                  onClick={() => setAllowMultiSeries((v) => !v)}
                  aria-pressed={allowMultiSeries}
                  className="rounded-md border border-white/10 bg-black/50 p-1.5 text-foreground transition hover:border-white/20 hover:text-white"
                >
                  {allowMultiSeries ? (
                    <SquareCheckIcon className="h-4 w-4" />
                  ) : (
                    <SquareIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
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
              <div className="mt-1 flex items-center justify-between text-[11px] text-foreground/60">
                <span>Force live fetch?</span>
                <button
                  type="button"
                  onClick={() => setForceRefresh((v) => !v)}
                  aria-pressed={forceRefresh}
                  className="rounded-md border border-white/10 bg-black/50 p-1.5 text-foreground transition hover:border-white/20 hover:text-white"
                >
                  {forceRefresh ? <SquareCheckIcon className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
                </button>
              </div>
            </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Timeframe</span>
            <select
              className="rounded-md border border-white/20 bg-[#0E0F15] px-3 py-2 text-foreground shadow-inner outline-none transition hover:border-white/30 focus:border-white/40"
              style={{ backgroundColor: "#0E0F15" }}
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

          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Hide outliers</span>
              <span className="text-[11px] text-foreground/60">Suppress far-right strength tail.</span>
            </div>
            <button
              type="button"
              onClick={() => setHideOutliers(!hideOutliers)}
              aria-pressed={hideOutliers}
              className="rounded-md border border-white/10 bg-black/50 p-2 text-foreground transition hover-border-white/20 hover:text-white"
            >
              {hideOutliers ? (
                <SquareCheckIcon className="h-4 w-4" />
              ) : (
                <SquareIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {advancedSection(tournamentFilters, setTournamentFilters, hideOutliers, setHideOutliers)}

            {seriesOptions.length > 0 && (
              <div className="space-y-2 rounded-md border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                  Select a series
                </div>
                <div className="flex flex-wrap gap-2">
                  {seriesOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onSelectSeries(opt.key)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        selectedSeriesKey === opt.key
                          ? "border-white/60 bg-white/20 text-white"
                          : "border-white/15 bg-black/40 text-foreground hover:border-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
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
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:border-white/20 hover:text-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        )}
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
    characters: "",
    filterStates: "",
    minEntrants: "",
    maxEntrants: "",
    minMaxEventEntrants: "",
    largeEventThreshold: "",
    minLargeEventShare: "",
    startAfter: "",
  });
  const [tournamentFilters, setTournamentFilters] = useState<TournamentFilters>({
    state: "",
    series: "",
    slugOrUrl: "",
    timeframe: "3m",
    characters: "",
    filterStates: "",
    minEntrants: "",
    maxEntrants: "",
    minMaxEventEntrants: "",
    largeEventThreshold: "",
    minLargeEventShare: "",
    startAfter: "",
  });
  const [chartData, setChartData] = useState<PlayerPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowMultiSeries, setAllowMultiSeries] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [seriesOptions, setSeriesOptions] = useState<Array<{ key: string; label: string }>>([]);
  const [selectedSeriesKey, setSelectedSeriesKey] = useState<string | null>(null);
  const [hideOutliers, setHideOutliers] = useState(false);
  const [pendingQueryApply, setPendingQueryApply] = useState(false);
  const [pendingMobileClose, setPendingMobileClose] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryView = params.get("view");
    const queryTournamentUrl =
      params.get("tournamentUrl") ?? params.get("tournament_url") ?? params.get("tournament");

    if (queryView === "tournament" || queryTournamentUrl) {
      setViewType("tournament");
    }
    if (queryTournamentUrl) {
      setTournamentFilters((prev) => ({ ...prev, slugOrUrl: queryTournamentUrl }));
      setPendingQueryApply(true);
    }
  }, []);

  const selectedMonthsBack = useMemo(
    () => TIMEFRAME_TO_MONTHS[stateFilters.timeframe] ?? 3,
    [stateFilters.timeframe],
  );
  const chartPoints = useMemo(
    () =>
      chartData.filter(
        (p) =>
          Number.isFinite(p.weighted_win_rate) &&
          Number.isFinite(p.opponent_strength),
      ),
    [chartData],
  );
  const displayedPoints = useMemo(() => {
    if (!hideOutliers) return chartPoints;
    if (chartPoints.length < 6) return chartPoints;

    const strengths = chartPoints
      .map((p) => p.opponent_strength ?? 0)
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);
    if (!strengths.length) return chartPoints;

    const percentile = (arr: number[], p: number) => {
      const idx = (arr.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    };
    const upperBound = percentile(strengths, 0.99);
    const keepIfHighWin = (p: PlayerPoint) => (p.weighted_win_rate ?? 0) >= 0.7;

    return chartPoints.filter((p) => {
      const strength = p.opponent_strength;
      if (strength === undefined) return true;
      if (keepIfHighWin(p)) return true;
      return strength <= upperBound;
    });
  }, [chartPoints, hideOutliers]);

  const filteredRows = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return displayedPoints;
    return displayedPoints.filter((row) => (row.gamer_tag ?? "").toLowerCase().includes(term));
  }, [displayedPoints, searchQuery]);

  const toggleSelectedPlayer = (row: PlayerPoint) => {
    const key = playerKey(row);
    if (!key) return;
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const buildStateQuery = () => {
    const params = new URLSearchParams({
      state: stateFilters.region.trim().toUpperCase(),
      months_back: String(selectedMonthsBack),
      limit: "0",
    });
    if (stateFilters.characters.trim()) {
      const firstCharacter = stateFilters.characters.split(",")[0]?.trim();
      if (firstCharacter) params.set("character", firstCharacter);
    }
    const maybeSet = (key: string, val: string) => {
      if (val.trim().length > 0) params.set(key, val.trim());
    };
    maybeSet("min_entrants", stateFilters.minEntrants);
    maybeSet("max_entrants", stateFilters.maxEntrants);
    maybeSet("min_max_event_entrants", stateFilters.minMaxEventEntrants);
    maybeSet("large_event_threshold", stateFilters.largeEventThreshold);
    maybeSet("min_large_event_share", stateFilters.minLargeEventShare);
    if (stateFilters.startAfter) params.set("start_after", stateFilters.startAfter);
    if (stateFilters.filterStates.trim()) {
      stateFilters.filterStates
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .forEach((code) => params.append("filter_state", code));
    }
    return params;
  };

  const parseTournamentSlug = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return { slug: "", slugWithPrefix: "", baseSlug: "", baseSlugWithPrefix: "", raw: "" };
    }
    const parts = trimmed.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "tournament");
    const rawSlug =
      (idx >= 0 && parts[idx + 1] ? parts[idx + 1] : parts[parts.length - 1]) ?? "";
    const baseRaw = rawSlug.replace(/-\d+$/, "");
    const withPrefix = rawSlug.startsWith("tournament/") ? rawSlug : `tournament/${rawSlug}`;
    const baseWithPrefix = baseRaw.startsWith("tournament/") ? baseRaw : `tournament/${baseRaw}`;
    return {
      slug: rawSlug,
      slugWithPrefix: withPrefix,
      baseSlug: baseRaw,
      baseSlugWithPrefix: baseWithPrefix,
      raw: rawSlug,
    };
  };

  const buildTournamentQuery = (seriesKey?: string, allowMulti?: boolean) => {
    const monthsBack = TIMEFRAME_TO_MONTHS[tournamentFilters.timeframe] ?? 3;
    const params = new URLSearchParams({
      months_back: String(monthsBack),
      limit: "0",
    });
    if (forceRefresh) params.set("refresh", "true");
    if (tournamentFilters.state.trim()) {
      params.set("state", tournamentFilters.state.trim().toUpperCase());
    }
    if (seriesKey) {
      params.set("series_key", seriesKey);
    } else {
      const {
        slug,
        slugWithPrefix,
        baseSlug,
        baseSlugWithPrefix,
        raw,
      } = parseTournamentSlug(tournamentFilters.slugOrUrl);
      if (slug || slugWithPrefix) {
        if (raw) params.append("tournament_slug_contains", raw);
        const baseRaw = raw.replace(/-\d+$/, "");
        if (baseRaw && baseRaw !== raw) params.append("tournament_slug_contains", baseRaw);
        if (slug) params.append("tournament_slug_contains", slug);
        if (baseSlug && baseSlug !== slug) params.append("tournament_slug_contains", baseSlug);
        if (slugWithPrefix) params.append("tournament_slug_contains", slugWithPrefix);
        if (baseSlugWithPrefix && baseSlugWithPrefix !== slugWithPrefix) {
          params.append("tournament_slug_contains", baseSlugWithPrefix);
        }
      }
      if (tournamentFilters.series.trim()) {
        params.set("tournament_contains", tournamentFilters.series.trim());
      }
    }
    if (tournamentFilters.filterStates.trim()) {
      tournamentFilters.filterStates
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .forEach((code) => params.append("filter_state", code));
    }
    if (allowMulti) {
      params.set("allow_multi", "true");
    }
    const maybeSet = (key: string, val: string) => {
      if (val.trim().length > 0) params.set(key, val.trim());
    };
    maybeSet("min_entrants", tournamentFilters.minEntrants);
    maybeSet("max_entrants", tournamentFilters.maxEntrants);
    maybeSet("min_max_event_entrants", tournamentFilters.minMaxEventEntrants);
    maybeSet("min_large_event_share", tournamentFilters.minLargeEventShare);
    if (tournamentFilters.startAfter) {
      params.set("start_after", tournamentFilters.startAfter);
    }
    return params;
  };

  const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim());

  const loadPrecomputedSeries = (
    params: URLSearchParams,
    originAllowMulti: boolean,
    allowRetry = true,
  ) => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/precomputed_series?${params.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (res.status === 412 && allowRetry && params.get("allow_multi") !== "true") {
          const retryParams = new URLSearchParams(params);
          retryParams.set("allow_multi", "true");
          return loadPrecomputedSeries(retryParams, originAllowMulti, false);
        }
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then(
        (json: {
          results?: PlayerPoint[];
          series_keys?: string[];
          resolved_labels?: string[];
        }) => {
          if (!json || typeof json !== "object") {
            setSeriesOptions([]);
            setChartData([]);
            setError("Select a series from the options or Allow Multiple Series to load data.");
            return;
          }
          const requestedSeriesKey = params.get("series_key");
          const allowMultiParam = params.get("allow_multi") === "true";
          const hasSeriesList = json.series_keys && json.series_keys.length > 0;

          if (allowMultiParam) {
            if (originAllowMulti) {
              setSeriesOptions([]);
              setChartData(json.results ?? []);
            } else if (!requestedSeriesKey && hasSeriesList) {
              const labels = json.resolved_labels ?? [];
              const seriesKeys = json.series_keys ?? [];
              setSeriesOptions(
                seriesKeys.map((key, idx) => ({
                  key,
                  label: labels[idx] ?? key,
                })),
              );
              setChartData([]);
              setError("Select a series from the options or Allow Multiple Series to load data.");
            } else {
              setSeriesOptions([]);
              setChartData(json.results ?? []);
            }
            return;
          }

          setSeriesOptions([]);
          setChartData(json.results ?? []);
          if ((json.results ?? []).length === 0) {
            setError("No data found. Check your state parameter and filters.");
          }
        },
      )
      .catch((err) => {
        setError(`${(err as Error).message} — Perhaps check your state parameters and filters?`);
        setChartData([]);
        setSeriesOptions([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleApply = () => {
    if (viewType === "state" && !stateFilters.region.trim()) {
      setError("Select a state to run the search.");
      setChartData([]);
      return;
    }

    if (viewType === "state") {
      const params = buildStateQuery();
      setIsLoading(true);
      setError(null);
    fetch(`/api/precomputed?${params.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((json: { results?: PlayerPoint[] }) => {
        setChartData(json.results ?? []);
        if ((json.results ?? []).length === 0) {
          setError("No data found. Check your state parameter and filters.");
        }
      })
      .catch((err) => {
        setError(`${(err as Error).message} — check your state parameter and filters.`);
        setChartData([]);
      })
        .finally(() => setIsLoading(false));
      return;
    }
    const hasSeries = tournamentFilters.series.trim().length > 0;
    const hasSlug = tournamentFilters.slugOrUrl.trim().length > 0;
    if (!hasSeries && !hasSlug) {
      setError("Provide a tournament series or URL/slug to fetch tournament data.");
      return;
    }

    const { slug, slugWithPrefix } = parseTournamentSlug(tournamentFilters.slugOrUrl);
    const monthsBack = TIMEFRAME_TO_MONTHS[tournamentFilters.timeframe] ?? 3;
    const maybeSet = (params: URLSearchParams, key: string, val: string) => {
      if (val.trim().length > 0) params.set(key, val.trim());
    };
    const DEFAULT_VIDEOGAME_ID = "1386";

    // If a specific tournament slug/URL is provided, hit the search endpoint for that exact slug.
    const urlValue = tournamentFilters.slugOrUrl.trim();
    const hasUrl = isLikelyUrl(urlValue);
    if (slug || slugWithPrefix || hasUrl) {
      const params = new URLSearchParams({
        months_back: String(monthsBack),
        limit: "0",
        videogame_id: DEFAULT_VIDEOGAME_ID,
      });
      if (forceRefresh) params.set("refresh", "true");
      if (tournamentFilters.state.trim()) {
        params.set("state", tournamentFilters.state.trim().toUpperCase());
      }
      if (slug || slugWithPrefix) params.append("tournament_slug", slug || slugWithPrefix);
      if (hasUrl) {
        params.set("tournament_url", urlValue);
      }
      if (tournamentFilters.filterStates.trim()) {
        tournamentFilters.filterStates
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
          .forEach((code) => params.append("filter_state", code));
      } else if (tournamentFilters.state.trim()) {
        params.set("filter_state", tournamentFilters.state.trim().toUpperCase());
      }
      maybeSet(params, "character", tournamentFilters.characters);
      maybeSet(params, "min_entrants", tournamentFilters.minEntrants);
      maybeSet(params, "max_entrants", tournamentFilters.maxEntrants);
      maybeSet(params, "min_max_event_entrants", tournamentFilters.minMaxEventEntrants);
      maybeSet(params, "large_event_threshold", tournamentFilters.largeEventThreshold);
      maybeSet(params, "min_large_event_share", tournamentFilters.minLargeEventShare);
      if (tournamentFilters.startAfter) params.set("start_after", tournamentFilters.startAfter);

      setSeriesOptions([]);
      setSelectedSeriesKey(null);
      setIsLoading(true);
      setError(null);
      fetch(`/api/search/by-slug?${params.toString()}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) {
            // Try to capture upstream error details for easier debugging.
            const data = await res.json().catch(() => null);
            const upstream = (data as { upstream?: string } | null)?.upstream;
            const message = upstream ? `API error ${res.status}: ${upstream}` : `API error ${res.status}`;
            throw new Error(message);
          }
          return res.json();
        })
        .then((json: { results?: PlayerPoint[] }) => {
          setChartData(json.results ?? []);
          if ((json.results ?? []).length === 0) {
            setError("No data found. Check your state parameter and filters.");
          }
        })
        .catch((err) => {
          setError(`${(err as Error).message} — check your state parameter and filters.`);
          setChartData([]);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    // Otherwise fall back to precomputed series discovery.
    const params = buildTournamentQuery(undefined, allowMultiSeries);
    setSelectedSeriesKey(null);
    loadPrecomputedSeries(params, allowMultiSeries);
  };

  const handleApplyFromMobile = () => {
    const hasSlugOrUrl = tournamentFilters.slugOrUrl.trim().length > 0;
    const hasSeriesQuery = tournamentFilters.series.trim().length > 0;

    if (viewType === "state" || (viewType === "tournament" && hasSlugOrUrl)) {
      setPendingMobileClose(false);
      setIsMobilePanelOpen(false);
      handleApply();
      return;
    }

    if (viewType === "tournament" && hasSeriesQuery) {
      setPendingMobileClose(true);
      handleApply();
      return;
    }

    setPendingMobileClose(false);
    setIsMobilePanelOpen(false);
    handleApply();
  };

  const handleReset = () => {
    setViewType("state");
    setStateFilters({
      region: "",
      timeframe: "3m",
      characters: "",
      filterStates: "",
      minEntrants: "",
      maxEntrants: "",
      minMaxEventEntrants: "",
      largeEventThreshold: "",
      minLargeEventShare: "",
      startAfter: "",
    });
    setTournamentFilters({
      state: "",
      series: "",
      slugOrUrl: "",
      timeframe: "3m",
      characters: "",
      filterStates: "",
      minEntrants: "",
      maxEntrants: "",
      minMaxEventEntrants: "",
      largeEventThreshold: "",
      minLargeEventShare: "",
      startAfter: "",
    });
    setAllowMultiSeries(false);
    setSeriesOptions([]);
    setSelectedSeriesKey(null);
    setHideOutliers(false);
  };

  useEffect(() => {
    if (!pendingQueryApply) return;
    if (viewType !== "tournament") return;
    if (!tournamentFilters.slugOrUrl.trim()) return;
    handleApply();
    setPendingQueryApply(false);
  }, [pendingQueryApply, viewType, tournamentFilters.slugOrUrl, handleApply]);

  useEffect(() => {
    if (!pendingMobileClose) return;
    if (isLoading) return;
    if (seriesOptions.length > 0) {
      setPendingMobileClose(false);
      return;
    }
    setIsMobilePanelOpen(false);
    setPendingMobileClose(false);
  }, [pendingMobileClose, isLoading, seriesOptions.length]);

  const ChartTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload as PlayerPoint | undefined;
    if (!row) return null;
    const winRate = `${Math.round((row.weighted_win_rate ?? 0) * 100)}%`;
    const strength =
      row.opponent_strength !== undefined
        ? Number(row.opponent_strength.toFixed(3))
        : "—";

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__name">{row.gamer_tag ?? "Unknown"}</div>
        <div className="chart-tooltip__line">
          <span>Win rate</span>
          <span>{winRate}</span>
        </div>
        <div className="chart-tooltip__line">
          <span>Opp strength</span>
          <span>{strength}</span>
        </div>
      </div>
    );
  };

  const renderPoint = (props: any) => {
    const { cx, cy, payload } = props ?? {};
    if (cx === undefined || cy === undefined) return <g />;
    const row = payload as PlayerPoint | undefined;
    const isSelected = row ? selectedPlayers.has(playerKey(row)) : false;
    if (isSelected) {
      const size = 18;
      return (
        <image
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          href="/star-icon.svg"
          aria-hidden
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill="#4ade80"
        fillOpacity={0.95}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={0.6}
      />
    );
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

      <main className="page-shell page-shell--visible page-shell--fluid page-shell--flush">
        <Header mainVisible />

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
                allowMultiSeries={allowMultiSeries}
                setAllowMultiSeries={setAllowMultiSeries}
                forceRefresh={forceRefresh}
                setForceRefresh={setForceRefresh}
                seriesOptions={seriesOptions}
                selectedSeriesKey={selectedSeriesKey}
                onSelectSeries={(key) => {
                  setSelectedSeriesKey(key);
                  loadPrecomputedSeries(buildTournamentQuery(key, false), false);
                }}
                hideOutliers={hideOutliers}
                setHideOutliers={setHideOutliers}
              />
            )}
          </aside>

          <div className="flex-1 min-w-0 p-4 md:p-8">
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

            <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold">Dashboard</h1>
                  <p className="mt-2 text-sm text-foreground/70">
                    Pick filters, then render a state-wide view of weighted win rate vs opponent strength.
                  </p>
                </div>
                <a
                  href="https://docs.smash.watch"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground shadow-lg shadow-black/20 backdrop-blur transition hover:border-white/25 hover:bg-white/20"
                >
                  Help
                </a>
              </div>
              <div className="mt-4 space-y-3">
                {error && (
                  <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}
                {isLoading && (
                  <div className="text-sm text-foreground/70">Loading data…</div>
                )}
                {!isLoading && !error && chartData.length === 0 && (
                  <div className="text-sm text-foreground/60">
                    No data yet. Apply filters to fetch state-wide metrics.
                  </div>
                )}
                {displayedPoints.length > 0 && (
                  <>
                    <div className="h-[480px] w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 24, right: 16, bottom: 24, left: 16 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
                          <XAxis
                            type="number"
                            dataKey="opponent_strength"
                            name="Opponent strength"
                            domain={[0, "auto"]}
                            stroke="rgba(255,255,255,0.55)"
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            type="number"
                            dataKey="weighted_win_rate"
                            name="Weighted win rate"
                            domain={[0, 1]}
                            tickFormatter={(val) => `${Math.round((val ?? 0) * 100)}%`}
                            stroke="rgba(255,255,255,0.55)"
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <RechartsTooltip<number, string>
                            cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.25)" }}
                            content={(props: TooltipContentProps<number, string>) => (
                              <ChartTooltip {...props} />
                            )}
                            wrapperStyle={{ transition: "none" }}
                            animationDuration={0}
                          />
                          <Scatter
                            name="Players"
                            data={displayedPoints}
                            shape={renderPoint}
                            isAnimationActive={false}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-foreground/60">
                        <div className="flex items-center gap-3">
                          <span>Players</span>
                          <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search player"
                            className="w-44 rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-normal uppercase tracking-[0.08em] text-foreground shadow-inner outline-none transition hover:border-white/25 focus:border-white/40 focus:bg-white/10"
                            aria-label="Search players by gamer tag"
                          />
                        </div>
                        <span className="ml-auto">{filteredRows.length} rows</span>
                      </div>
                      <Table>
                        <TableHeader className="bg-white/5 text-sm font-medium">
                          <TableRow className="border-b border-white/5">
                            <TableHead className="w-12 px-4 py-3 text-left">Select</TableHead>
                            <TableHead className="px-4 py-3 text-left">Player</TableHead>
                            <TableHead className="px-4 py-3 text-left">Win rate</TableHead>
                            <TableHead className="px-4 py-3 text-left">Opp strength</TableHead>
                            <TableHead className="px-4 py-3 text-left">State</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-sm">
                          {filteredRows.map((row, idx) => (
                            <TableRow
                              key={`${row.player_id ?? row.gamer_tag ?? "row"}-${idx}`}
                              className="border-b border-white/5 last:border-0"
                            >
                              <TableCell className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleSelectedPlayer(row)}
                                  aria-pressed={selectedPlayers.has(playerKey(row))}
                                  className="rounded-md border border-white/10 bg-black/40 p-1.5 text-foreground transition hover:border-white/20 hover:text-white"
                                >
                                  {selectedPlayers.has(playerKey(row)) ? (
                                    <SquareCheckIcon className="h-4 w-4" />
                                  ) : (
                                    <SquareIcon className="h-4 w-4" />
                                  )}
                                </button>
                              </TableCell>
                              <TableCell className="px-4 py-3 font-semibold">
                                {row.gamer_tag ?? "Unknown"}
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                {`${Math.round((row.weighted_win_rate ?? 0) * 100)}%`}
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                {row.opponent_strength !== undefined
                                  ? row.opponent_strength.toFixed(3)
                                  : "—"}
                              </TableCell>
                              <TableCell className="px-4 py-3">{row.home_state ?? "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
                {chartData.length > chartPoints.length && (
                  <div className="px-4 py-2 text-xs text-foreground/60">
                    {chartData.length - chartPoints.length} row(s) skipped (missing win rate or opponent strength).
                  </div>
                )}
                {displayedPoints.length < chartPoints.length && hideOutliers && (
                  <div className="px-4 py-2 text-xs text-foreground/60">
                    {chartPoints.length - displayedPoints.length} outlier(s) hidden.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-30 flex items-start overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            isMobilePanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsMobilePanelOpen(false)}
        >
          <aside
            id="mobile-filter-panel"
            className={`relative left-0 z-40 flex w-72 min-h-full flex-col gap-4 overflow-y-auto border-r border-white/10 bg-black/90 p-4 pb-16 backdrop-blur transition-transform duration-200 ${
              isMobilePanelOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
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
              onApply={handleApplyFromMobile}
              onReset={handleReset}
              allowMultiSeries={allowMultiSeries}
              setAllowMultiSeries={setAllowMultiSeries}
              forceRefresh={forceRefresh}
              setForceRefresh={setForceRefresh}
              seriesOptions={seriesOptions}
              selectedSeriesKey={selectedSeriesKey}
              onSelectSeries={(key) => {
                setSelectedSeriesKey(key);
                loadPrecomputedSeries(buildTournamentQuery(key, false), false);
                setPendingMobileClose(false);
                setIsMobilePanelOpen(false);
              }}
              hideOutliers={hideOutliers}
              setHideOutliers={setHideOutliers}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
