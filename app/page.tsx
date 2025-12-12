"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import LetterSwapForward from "@/components/fancy/text/letter-swap-forward-anim";

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

type SpotlightCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function SpotlightCard({ title, subtitle, body }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  return (
    <div
      ref={ref}
      className="spotlight-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="article"
    >
      <div className="spotlight-card__subtitle">{subtitle}</div>
      <div className="spotlight-card__title">{title}</div>
      <p className="spotlight-card__body">{body}</p>
    </div>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps<number, string>) {
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
  const initialSkipSplash =
    typeof window !== "undefined" &&
    (() => {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("skipSplash");
      return val === "1" || val === "true";
    })();
  const [skipSplash, setSkipSplash] = useState<boolean>(!!initialSkipSplash);
  const [phase, setPhase] = useState<SplashPhase>(initialSkipSplash ? "hidden" : "full");
  const frames = ["smash.watch", "smas.wtch", "sma.wch", "ss.wh", "s.w"];
  const [frameIndex, setFrameIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const dataSources: DataSource[] = [
    {
      id: "ny-featured",
      label: "NY",
      api: `/api/precomputed?state=NY&months_back=3&limit=0&filter_state=NY&min_entrants=32`,
    },
    {
      id: "ga-4o4",
      label: "GA · 4o4 series",
      api: `/api/precomputed_series?state=GA&months_back=3&limit=0&tournament_contains=4o4&series_key=4o4-by-sh33rz-weekly-smash`,
    },
    {
      id: "ga-default",
      label: "GA",
      api: `/api/precomputed?state=GA&months_back=3&limit=0&filter_state=GA&min_entrants=32`,
    },
    {
      id: "wa-port-priority-9",
      label: "WA · Port Priority 9",
      api: `/api/precomputed_series?state=WA&months_back=3&limit=0&series_key=port-priority-9&videogame_id=1386`,
    },
  ];
  const [selectedSourceId, setSelectedSourceId] = useState(dataSources[0]?.id ?? "ny-featured");
  const [players, setPlayers] = useState<PlayerPoint[]>([]);
  const [hideOutliers, setHideOutliers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedSource = dataSources.find((src) => src.id === selectedSourceId) ?? dataSources[0];
  const sourceExplainers: Record<
    string,
    { title: string; summary: string; filters: string[]; footnote?: string }
  > = {
    "ny-featured": {
      title: "New York snapshot",
      summary:
        "Full-state view of who is punching up. Weighted win rate puts more emphasis on set count and tougher opponents.",
      filters: [
        "State: New York only",
        "Players who average brackets with 32+ entrants",
        "Last 3 months of events",
      ],
      footnote: "Toggled outlier hiding trims the top ~1% of opponent strength while keeping high win rates.",
    },
    "ga-4o4": {
      title: "Georgia · 4o4 weekly series",
      summary:
        "Focused on the sh33rz 4o4 weeklies to see who thrives in that environment without the broader state rollup.",
      filters: [
        "State: Georgia",
        "Series filter: 4o4 weeklies only",
        "Last 3 months; keep all entrant sizes",
      ],
      footnote: "Use outlier hiding to tame the high-strength tails if the series has a few stacked brackets.",
    },
    "ga-default": {
      title: "Georgia snapshot",
      summary:
        "Broader GA view with the same weighted win rate vs opponent strength lens used for the NY example.",
      filters: [
        "State: Georgia only",
        "Players who average brackets with 32+ entrants",
        "Last 3 months of events",
      ],
      footnote: "Outlier toggle removes the strongest ~1% by opponent strength unless a player is winning 70%+.",
    },
    "wa-port-priority-9": {
      title: "Port Priority 9 spotlight",
      summary: "Washington’s Port Priority 9 visualized. You can really see where the competition got tough! The top part trails eastward as opponents got tougher and tougher.",
      filters: [
        "State: Washington",
        "Series filter: Port Priority 9 only",
        "Last 3 months",
      ],
      footnote: "Great for checking who stood out during the Port Priority run without broader WA brackets.",
    },
    default: {
      title: "Data snapshot",
      summary:
        "Scatter plot of weighted win rate against opponent strength. Filters adapt to whichever dashboard is selected.",
      filters: ["State-level filter", "Last 3 months"],
    },
  };
  const explainer = sourceExplainers[selectedSource.id] ?? sourceExplainers.default;

  useEffect(() => {
    if (skipSplash) return;
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
  }, [skipSplash]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setHideOutliers(selectedSourceId === "wa-port-priority-9");
  }, [selectedSourceId]);

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
    // Update skipSplash if query changes client-side (e.g., navigation)
    const params = new URLSearchParams(window.location.search);
    const val = params.get("skipSplash");
    const shouldSkip = val === "1" || val === "true";
    if (shouldSkip !== skipSplash) {
      setSkipSplash(shouldSkip);
      if (shouldSkip) setPhase("hidden");
    }

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

  const [navStuck, setNavStuck] = useState(false);
  useEffect(() => {
    const handleStick = () => setNavStuck(window.scrollY > 4);
    handleStick();
    window.addEventListener("scroll", handleStick);
    return () => window.removeEventListener("scroll", handleStick);
  }, []);

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
        <nav
          className={[
            "site-nav",
            mainVisible ? "site-nav--visible" : "",
            navStuck ? "site-nav--stuck" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="site-nav__inner">
          <Link
            href="/?skipSplash=1"
            className="site-nav__brand"
            onClick={() => setNavOpen(false)}
          >
              <span className="site-nav__logo-dot" />
              <span className="site-nav__wordmark">smash.watch</span>
            </Link>
            <div className="site-nav__links site-nav__links--desktop">
              <Link href="/dashboard" className="site-nav__link">
                <LetterSwapForward label="Dashboard" staggerDuration={0} />
              </Link>
              <a href="https://docs.smash.watch" className="site-nav__link">
                <LetterSwapForward label="Docs" staggerDuration={0} />
              </a>
            </div>
            <a
              className="site-nav__cta site-nav__cta--desktop"
              href="https://github.com/ozdotdotdot/smashDA"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                aria-hidden
                className="site-nav__star"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3.5 14.9 9l5.6.8-4 3.9.9 5.6L12 16.7 6.6 19.3l.9-5.6-4-3.9L9 9l3-5.5Z" />
              </svg>
              Star on GitHub
            </a>
            <button
              className="site-nav__toggle"
              type="button"
              aria-expanded={navOpen}
              aria-label="Toggle navigation"
              aria-controls="site-nav-mobile"
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className="site-nav__toggle-line" />
              <span className="site-nav__toggle-line" />
            </button>
          </div>
          <div
            id="site-nav-mobile"
            className={`site-nav__mobile ${navOpen ? "site-nav__mobile--open" : ""}`}
            aria-hidden={!navOpen}
          >
            <div className="site-nav__links site-nav__links--mobile">
              <Link href="/dashboard" className="site-nav__link" onClick={() => setNavOpen(false)}>
                <LetterSwapForward label="Dashboard" staggerDuration={0} />
              </Link>
              <a
                href="https://docs.smash.watch"
                className="site-nav__link"
                onClick={() => setNavOpen(false)}
              >
                <LetterSwapForward label="Docs" staggerDuration={0} />
              </a>
            </div>
            <a
              className="site-nav__cta site-nav__cta--mobile"
              href="https://github.com/ozdotdotdot/smashDA"
              target="_blank"
              rel="noreferrer"
              onClick={() => setNavOpen(false)}
            >
              <svg
                aria-hidden
                className="site-nav__star"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3.5 14.9 9l5.6.8-4 3.9.9 5.6L12 16.7 6.6 19.3l.9-5.6-4-3.9L9 9l3-5.5Z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </nav>
        <header className="flex w-full flex-col gap-6">
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
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">
                v0.1 – precomputed US state data (~3 months)
              </p>
            </div>
          </div>
        </header>

        <section id="visualization" className="section section--split">
          <div className="section__copy">
            <h2 className="section__title">A single scatter plot that tells the story</h2>
            <p>
              Compare players in your scene at a glance. Each dot is a player, positioned by weighted win rate and opponent strength
               over the last 3 months. Switch states, filter by bracket size, and explore who’s actually cooking.
            </p>
            <p className="pill-label">Featured presets</p>
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
                  <Tooltip<number, string>
                    cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.25)" }}
                    content={(props: TooltipContentProps<number, string>) => (
                      <ChartTooltip {...props} />
                    )}
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
          <div className="info-card">
            <div className="info-card__title">{explainer.title}</div>
            <p className="info-card__summary">{explainer.summary}</p>
            <div className="info-card__filters" role="list">
              {explainer.filters.map((filter) => (
                <span key={filter} className="info-card__filter" role="listitem">
                  {filter}
                </span>
              ))}
            </div>
            {explainer.footnote ? <p className="info-card__footnote">{explainer.footnote}</p> : null}
          </div>
          <div className="section-divider" aria-hidden />
          <div className="cta-centered">
            <div className="cta-centered__headline">
              <span className="cta-centered__line">So what are you waiting for?</span>
              <span className="cta-centered__line">Start visualizing.</span>
            </div>
            <div className="cta-centered__action">
              <Link className="btn cta-centered__button" href="/dashboard">
                To the Dashboard
              </Link>
              <span className="cta-centered__icon" aria-hidden />
            </div>
          </div>
          <div className="section-divider" aria-hidden />
          <div className="spotlight-grid">
            <p className="spotlight-grid__header">Want to dig deeper?</p>
            <a href="https://docs.smash.watch" className="spotlight-card-link">
              <SpotlightCard
                title="Documentation"
                subtitle="Looking for docs?"
                body="Are you looking to figure out how to use the dashboard? Start with the docs and walkthroughs."
              />
            </a>
            <SpotlightCard
              title="How it works"
              subtitle="Curious about the pipeline?"
              body="Want to learn about how it all works? Peek at the data flow, metrics, and filtering logic."
            />
            <SpotlightCard
              title="About us"
              subtitle="Behind the scenes"
              body='Well it&apos;s just "me", but feel free to read more about the project and roadmap.'
            />
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
