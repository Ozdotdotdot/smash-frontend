"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

type SplashPhase = "full" | "compact" | "hidden";

type DataSource = {
  id: string;
  label: string;
  api: string;
};

type PlayerPoint = {
  player_id?: number;
  gamer_tag: string;
  weighted_win_rate: number;
  opponent_strength: number;
  home_state?: string;
};

type FilteredData = {
  filtered: PlayerPoint[];
  hidden: number;
  upperBound?: number;
};

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
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
}

export default function Home() {
  const [phase, setPhase] = useState<SplashPhase>("full");
  const frames = ["smash.watch", "smas.wtch", "sma.wch", "ss.wh", "s.w"];
  const [frameIndex, setFrameIndex] = useState(0);
  const dataSources: DataSource[] = [
    {
      id: "port-priority-9",
      label: "Port Priority 9",
      api: `/api/precomputed_series?state=WA&months_back=3&limit=0&series_key=port-priority-9`,
    },
    {
      id: "ga-4o4",
      label: "GA · 4o4 series",
      api: `/api/precomputed_series?state=GA&months_back=3&limit=0&tournament_contains=4o4&series_key=4o4-by-sh33rz-weekly-smash`,
    },
    {
      id: "ga-default",
      label: "GA sample",
      api: `/api/precomputed?state=GA&months_back=3&limit=0&filter_state=GA`,
    },
  ];
  const [selectedSourceId, setSelectedSourceId] = useState(dataSources[0]?.id ?? "port-priority-9");
  const [players, setPlayers] = useState<PlayerPoint[]>([]);
  const [hideOutliers, setHideOutliers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedSource = dataSources.find((src) => src.id === selectedSourceId) ?? dataSources[0];

  useEffect(() => {
    const firstFrameDuration = 1400; // linger a bit longer on the full name
    const frameDuration = 140; // quick collapse progression

    let intervalRef: ReturnType<typeof setInterval> | null = null;

    const startInterval = () =>
      setInterval(() => {
        setFrameIndex((idx) => {
          if (idx >= frames.length - 1) {
            if (intervalRef) clearInterval(intervalRef);
            return idx;
          }
          return idx + 1;
        });
      }, frameDuration);

    const initialDelay = setTimeout(() => {
      setFrameIndex((idx) => Math.min(idx + 1, frames.length - 1)); // advance after first linger
      intervalRef = startInterval();
    }, firstFrameDuration);

    const totalDuration =
      firstFrameDuration + frameDuration * (frames.length - 1);
    const shrinkTimer = setTimeout(() => setPhase("compact"), totalDuration + 120);
    const hideTimer = setTimeout(() => setPhase("hidden"), totalDuration + 700); // fade out after collapse
    return () => {
      if (intervalRef) clearInterval(intervalRef);
      clearTimeout(initialDelay);
      clearTimeout(shrinkTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const mainVisible = phase === "hidden";
  const markText = frames[frameIndex] ?? frames[0];
  const apiUrl = useMemo(() => selectedSource.api, [selectedSource]);
  const filteredData: FilteredData = useMemo(() => {
    if (!hideOutliers) return { filtered: players, hidden: 0 };
    if (players.length < 6) return { filtered: players, hidden: 0 };

    const strengths = players
      .map((p) => p.opponent_strength ?? 0)
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);
    if (!strengths.length) return { filtered: players, hidden: 0 };

    const percentile = (arr: number[], p: number) => {
      const idx = (arr.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    };

    // Tighter definition: drop only the far-right tail on opponent strength,
    // while always keeping strong performers.
    const upperBound = percentile(strengths, 0.99);
    const keepIfHighWin = (p: PlayerPoint) => (p.weighted_win_rate ?? 0) >= 0.7;

    const filtered = players.filter((p) => {
      const strength = p.opponent_strength;
      if (strength === undefined) return true;
      if (keepIfHighWin(p)) return true;
      return strength <= upperBound;
    });
    return {
      filtered,
      hidden: players.length - filtered.length,
      upperBound,
    };
  }, [hideOutliers, players]);

  useEffect(() => {
    if (!mainVisible) return; // delay data fetch until after splash finishes
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetch(apiUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((json: { results?: PlayerPoint[]; data?: PlayerPoint[] } | PlayerPoint[]) => {
        if (Array.isArray(json)) {
          setPlayers(json as PlayerPoint[]);
          return;
        }
        const rows = (json.results ?? json.data ?? []) as PlayerPoint[];
        setPlayers(rows);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [apiUrl, mainVisible]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className={[
          "splash",
          phase !== "full" ? "splash--compact" : "",
          phase === "hidden" ? "splash--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "splash__mark",
            phase !== "full" ? "splash__mark--compact" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {markText}
        </span>
        <div className="splash__glow" />
      </div>

      <main
        className={`page-shell ${mainVisible ? "page-shell--visible" : ""}`}
        aria-hidden={!mainVisible}
      >
        <header className="flex w-full flex-col gap-6">
          <div className="text-base font-semibold uppercase tracking-[0.3em] text-white">
            s.w
          </div>
          <div className="hero-banner">
            <div className="hero-inner space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                See who&apos;s actually good in your region.
              </h1>
              <p className="max-w-2xl text-lg text-foreground/75">
                Smash Watch crunches local bracket data to reveal who’s overperforming, who’s consistent, and who you should be watching out for.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn" href="/dashboard">
                  Open dashboard page
                </Link>
                <a className="btn btn--ghost" href="#visualization">
                  Jump to example chart
                </a>
                <a
                  className="btn btn--ghost"
                  href="https://github.com/ozdotdotdot/smashDA"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">
                v0.1 – precomputed US state data (~3 months) via API and notebooks.
              </p>
            </div>
          </div>
        </header>

        <section id="visualization" className="section section--split">
          <div className="section__copy">
            <h2 className="section__title">A single scatter plot that tells the story</h2>
            <p>
              View some of our featured dashboards! Each point is a player from your chosen state, positioned by weighted win rate
              and opponent strength. Filtered via API; rendered in Altair / Jupyter today,
              with a browser dashboard on the way..
            </p>
            <p className="text-sm text-foreground/65">
              Roadmap: browser-native dashboard, character filters, and per-region presets.
            </p>
            <div className="flex flex-wrap gap-2 pt-3">
              {dataSources.map((src) => (
                <button
                  key={src.id}
                  className={`state-pill ${selectedSourceId === src.id ? "state-pill--active" : ""}`}
                  onClick={() => setSelectedSourceId(src.id)}
                  type="button"
                >
                  {src.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-foreground/50">
              Data via precomputed API (last 3 months). Win rate vs opponent strength.
            </p>
          </div>
          <div className="chart-card">
            <div className="chart-card__header">
              <span className="mock-pill">
                {selectedSource.label} · {filteredData.filtered.length} players
              </span>
              <span className="mock-pill mock-pill--ghost">Weighted win rate vs strength</span>
              <button
                className={`pill-toggle ${hideOutliers ? "pill-toggle--active" : ""}`}
                type="button"
                onClick={() => setHideOutliers((v) => !v)}
              >
                {hideOutliers ? "Outliers hidden" : "Hide outliers"}
                {filteredData.hidden > 0 ? ` (${filteredData.hidden})` : ""}
              </button>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart margin={{ top: 24, right: 16, bottom: 24, left: 16 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
                  <XAxis
                    type="number"
                    dataKey="opponent_strength"
                    name="Opponent strength"
                    domain={[0, "auto"]}
                    stroke="rgba(255,255,255,0.55)"
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="weighted_win_rate"
                    name="Weighted win rate"
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
                    stroke="rgba(255,255,255,0.55)"
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.25)" }}
                    content={<ChartTooltip />}
                    wrapperStyle={{ transition: "none" }}
                    animationDuration={0}
                  />
                  <Scatter
                    data={filteredData.filtered}
                    fill="#4ade80"
                    fillOpacity={0.95}
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth={0.6}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
              {isLoading ? (
                <p className="chart-status">Loading data…</p>
              ) : error ? (
                <p className="chart-status chart-status--error">Error: {error}</p>
              ) : filteredData.filtered.length === 0 ? (
                <p className="chart-status">No players for this state.</p>
              ) : hideOutliers && filteredData.hidden > 0 ? (
                <p className="chart-status text-xs text-foreground/60">
                  Hiding {filteredData.hidden} outlier(s)
                  {filteredData.upperBound ? ` above strength ≈ ${filteredData.upperBound.toFixed(3)}` : ""}.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/80">
            s.w
          </div>
          <div className="footer__links">
            <a href="https://github.com/ozdotdotdot/smashDA" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter/X
            </a>
            <a href="mailto:hello@smash.watch">Email</a>
          </div>
          <p className="text-xs text-foreground/55">
            Personal project by Ozair Khan. Not affiliated with Nintendo or start.gg.
          </p>
        </footer>
      </main>
    </div>
  );
}
