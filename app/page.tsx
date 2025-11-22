"use client";

import { useEffect, useState } from "react";

type SplashPhase = "full" | "compact" | "hidden";

export default function Home() {
  const [phase, setPhase] = useState<SplashPhase>("full");
  const frames = ["smash.watch", "smas.wtch", "sma.wch", "ss.wh", "s.w"];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const firstFrameDuration = 850; // linger a bit longer on the full name
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
    const hideTimer = setTimeout(() => setPhase("hidden"), totalDuration + 700); // fade out after collapse
    return () => {
      if (intervalRef) clearInterval(intervalRef);
      clearTimeout(initialDelay);
      clearTimeout(hideTimer);
    };
  }, []);

  const mainVisible = phase === "hidden";
  const markText = frames[frameIndex] ?? frames[0];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className={[
          "splash",
          phase === "hidden" ? "splash--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "splash__mark",
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
                <a className="btn" href="#visualization">
                  View example dashboard
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
              Each point is a player from your chosen state, positioned by weighted win rate
              and opponent strength. Filtered via API; rendered in Altair / Jupyter today,
              with a browser dashboard on the way.
            </p>
            <p className="text-sm text-foreground/65">
              Roadmap: browser-native dashboard, character filters, and per-region presets.
            </p>
          </div>
          <div className="mock-chart" aria-hidden="true">
            <div className="mock-chart__header">
              <span className="mock-pill">GA · last 3 months</span>
              <span className="mock-pill mock-pill--ghost">Weighted win rate vs strength</span>
            </div>
            <div className="mock-chart__body">
              <div className="mock-dot mock-dot--a" />
              <div className="mock-dot mock-dot--b" />
              <div className="mock-dot mock-dot--c" />
              <div className="mock-dot mock-dot--d" />
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
