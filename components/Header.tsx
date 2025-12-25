"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LetterSwapForward from "@/components/fancy/text/letter-swap-forward-anim";

type HeaderProps = {
  mainVisible: boolean;
};

export default function Header({ mainVisible }: HeaderProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [navStuck, setNavStuck] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setNavOpen(false);
    };
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
        <Link href="/?skipSplash=1" className="site-nav__brand" onClick={() => setNavOpen(false)}>
          <span className="site-nav__logo-dot" />
          <span className="site-nav__wordmark">smash.watch</span>
        </Link>
        <div className="site-nav__links site-nav__links--desktop">
          <Link href="/dashboard" className="site-nav__link">
            <LetterSwapForward label="Dashboard" staggerDuration={0} />
          </Link>
          <Link href="/howitworks" className="site-nav__link">
            <LetterSwapForward label="How it Works" staggerDuration={0} />
          </Link>
          <Link href="/about" className="site-nav__link">
            <LetterSwapForward label="About" staggerDuration={0} />
          </Link>
          <a href="https://docs.smash.watch" className="site-nav__link" target="_blank" rel="noreferrer">
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
          <Link href="/howitworks" className="site-nav__link" onClick={() => setNavOpen(false)}>
            <LetterSwapForward label="How it Works" staggerDuration={0} />
          </Link>
          <Link href="/about" className="site-nav__link" onClick={() => setNavOpen(false)}>
            <LetterSwapForward label="About" staggerDuration={0} />
          </Link>
          <a
            href="https://docs.smash.watch"
            className="site-nav__link"
            target="_blank"
            rel="noreferrer"
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
  );
}
