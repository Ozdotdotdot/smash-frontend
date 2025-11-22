"use client";

import { useEffect, useState } from "react";

type SplashPhase = "full" | "compact" | "hidden";

export default function Home() {
  const [phase, setPhase] = useState<SplashPhase>("full");
  const frames = ["smash.watch", "sash.wath", "ssh.wth", "ss.wh", "s.w"];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const firstFrameDuration = 500; // linger a bit longer on the full name
    const frameDuration = 140; // fast, snappy transitions for the rest

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
    const shrinkTimer = setTimeout(() => setPhase("compact"), totalDuration + 140);
    const hideTimer = setTimeout(() => setPhase("hidden"), totalDuration + 760);
    return () => {
      if (intervalRef) clearInterval(intervalRef);
      clearTimeout(initialDelay);
      clearTimeout(shrinkTimer);
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
        <header className="flex w-full items-start gap-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
              s.w
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Tournament awareness that greets you before the bracket starts.
            </h1>
            <p className="max-w-2xl text-lg text-foreground/75">
              We monitor the start.gg firehose and surface precomputed insight for your
              region&apos;s players and mains—no more scrubbing VODs to know who&apos;s a
              threat.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-foreground/75">
              <span className="pill">Instant precomputed metrics</span>
              <span className="pill">Character heatmaps</span>
              <span className="pill">State + major ready</span>
            </div>
          </div>
        </header>

        <section className="grid w-full gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/55">
              Spotlight
            </p>
            <p className="mt-3 text-lg font-semibold">Georgia, last 6 months</p>
            <p className="text-sm text-foreground/65">
              Precomputed weighted win-rate + opponent strength, ready to display in your
              dashboard of choice.
            </p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/55">
              Characters
            </p>
            <p className="mt-3 text-lg font-semibold">Marth, Sheik, Fox</p>
            <p className="text-sm text-foreground/65">
              Swap mains and the API will reshape the leaderboard and usage rates.
            </p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/55">
              Delivery
            </p>
            <p className="mt-3 text-lg font-semibold">API + visual layer</p>
            <p className="text-sm text-foreground/65">
              Pipe it into Altair/Matplotlib or your own UI; the splash is just the start.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
