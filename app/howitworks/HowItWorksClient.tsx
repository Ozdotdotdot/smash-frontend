"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LetterSwapForward from "@/components/fancy/text/letter-swap-forward-anim";

export default function HowItWorksClient() {
  const [navOpen, setNavOpen] = useState(false);
  const [navStuck, setNavStuck] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setNavOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleStick = () => setNavStuck(window.scrollY > 4);
    handleStick();
    window.addEventListener("scroll", handleStick);
    return () => window.removeEventListener("scroll", handleStick);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <nav
        className={[
          "site-nav",
          "site-nav--visible",
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
            <Link
              href="/dashboard"
              className="site-nav__link"
              onClick={() => setNavOpen(false)}
            >
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
            <Link
              href="/dashboard"
              className="site-nav__link"
              onClick={() => setNavOpen(false)}
            >
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

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-24 pt-28 sm:pt-32">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            How smash.watch works
          </h1>
          <p className="text-lg text-foreground/75">
            A practical walkthrough of the end-to-end pipeline: where the data comes from, how it
            gets cleaned and filtered, what the metrics mean, and how the frontend turns it into the
            visuals you see.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="btn" href="/dashboard">
              Explore the dashboard
            </Link>
            <a className="btn btn--ghost" href="https://docs.smash.watch">
              Read the docs
            </a>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Big picture</h2>
          <p className="text-foreground/75">
            Smash Watch is built around a simple idea: rank performance by accounting for opponent
            strength. Raw win-rate alone is noisy (farm weak brackets, inflate numbers), so the
            pipeline estimates how strong your opposition was and weights results accordingly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pipeline overview</h2>
          <ol className="list-decimal space-y-3 pl-5 text-foreground/75">
            <li>
              <span className="font-medium text-foreground">Ingest</span>: pull event and set data
              from tournament sources.
            </li>
            <li>
              <span className="font-medium text-foreground">Normalize</span>: clean identifiers,
              unify player tags, and standardize fields (dates, states, entrants, etc).
            </li>
            <li>
              <span className="font-medium text-foreground">Filter</span>: apply region/timeframe
              rules, tournament-size thresholds, and optional character constraints.
            </li>
            <li>
              <span className="font-medium text-foreground">Score</span>: compute per-player metrics
              like weighted win rate and opponent strength.
            </li>
            <li>
              <span className="font-medium text-foreground">Serve</span>: expose aggregated results
              through the API endpoints this frontend consumes.
            </li>
            <li>
              <span className="font-medium text-foreground">Visualize</span>: render scatterplots
              and tables with interactive filtering.
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Key metrics</h2>
          <div className="space-y-4 text-foreground/75">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-semibold text-foreground">Weighted win rate</div>
              <p className="mt-2">
                A win-rate that rewards wins over stronger opponents more than wins over weaker
                opponents. This helps separate “wins because you played killers” from “wins because
                you played mostly new players”.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-semibold text-foreground">Opponent strength</div>
              <p className="mt-2">
                A summary of the typical strength of opponents a player faced in the selected slice
                (state, timeframe, series, etc). This is what makes the chart useful: you can see
                who performs well relative to the difficulty of their matches.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Filtering logic</h2>
          <p className="text-foreground/75">
            Filters are designed to answer real questions quickly. They control what data is
            included in the computations, not just what’s displayed.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-foreground/75">
            <li>
              <span className="font-medium text-foreground">Region/state</span>: restrict to a
              geographic area to get a true “local” view.
            </li>
            <li>
              <span className="font-medium text-foreground">Timeframe</span>: keep results current
              and reduce historical noise.
            </li>
            <li>
              <span className="font-medium text-foreground">Event thresholds</span>: ignore tiny
              tournaments when you want more stable signals.
            </li>
            <li>
              <span className="font-medium text-foreground">Characters</span>: optionally slice by
              character usage (when available in the source data).
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What to look for on the chart</h2>
          <ul className="list-disc space-y-2 pl-5 text-foreground/75">
            <li>
              High <span className="font-medium text-foreground">weighted win rate</span> and high{" "}
              <span className="font-medium text-foreground">opponent strength</span> often indicates
              top contenders.
            </li>
            <li>
              High weighted win rate but low opponent strength can mean a player is farming smaller
              locals, or is simply underrated and hasn’t played many killers yet.
            </li>
            <li>
              Lower weighted win rate with high opponent strength can still be valuable: it may
              represent players consistently attending stacked events.
            </li>
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-2xl font-semibold">Want the gritty details?</h2>
          <p className="text-foreground/75">
            This page is the conceptual overview. If you want the exact definitions, edge cases, and
            data caveats, the docs go deeper.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn" href="https://docs.smash.watch">
              Open documentation
            </a>
            <Link className="btn btn--ghost" href="/dashboard">
              Back to the dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

