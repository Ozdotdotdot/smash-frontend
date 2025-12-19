"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LetterSwapForward from "@/components/fancy/text/letter-swap-forward-anim";

export default function HowItWorksClient({
  title,
  markdown,
}: {
  title: string;
  markdown: string;
}) {
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
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          <p className="text-lg text-foreground/75">
            A technical walkthrough of the end-to-end pipeline: collection → processing → API →
            visualization.
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

        <section className="space-y-5">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-semibold" {...props} />,
              p: ({ node, ...props }) => <p className="text-foreground/75" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc space-y-2 pl-5 text-foreground/75" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal space-y-2 pl-5 text-foreground/75" {...props} />
              ),
              li: ({ node, ...props }) => <li className="marker:text-foreground/50" {...props} />,
              code: ({ node, className, children, ...props }) => {
                const text = typeof children === "string" ? children : "";
                const isInline = !text.includes("\n");
                return (
                  <code
                    className={
                      isInline
                        ? [
                            "rounded bg-white/10 px-1.5 py-0.5 text-sm text-foreground/90",
                            className ?? "",
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : ["text-sm text-foreground/90", className ?? ""]
                            .filter(Boolean)
                            .join(" ")
                    }
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ node, ...props }) => (
                <pre
                  className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-foreground/90"
                  {...props}
                />
              ),
              a: ({ node, href, ...props }) => {
                if (!href) return <a className="underline underline-offset-4" {...props} />;
                if (href.startsWith("/")) {
                  return <Link className="underline underline-offset-4" href={href} {...props} />;
                }
                return (
                  <a
                    className="underline underline-offset-4"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    {...props}
                  />
                );
              },
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-foreground" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-2 border-white/10 pl-4 text-foreground/75"
                  {...props}
                />
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Key metrics at a glance</h2>
          <div className="space-y-4 text-foreground/75">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-semibold text-foreground">Weighted win rate</div>
              <p className="mt-2">
                A win-rate adjusted for opponent quality, so wins against strong opponents count
                more than wins against weak opposition.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-semibold text-foreground">Opponent strength</div>
              <p className="mt-2">
                A summary of the strength of the opponents you faced in the selected slice (state,
                timeframe, series). This is what makes the scatterplot interpretable.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-semibold text-foreground">Filters</div>
              <p className="mt-2">
                Filters change what data is included in the calculation (not just what’s shown):
                state/region, timeframe, and event-size thresholds all affect the final numbers.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-2xl font-semibold">Want the gritty details?</h2>
          <p className="text-foreground/75">
            This page is the architectural overview. The docs go deeper on definitions, caveats, and
            usage.
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
