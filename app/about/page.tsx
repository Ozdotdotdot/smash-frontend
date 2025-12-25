import type { Metadata } from "next";
import Image from "next/image";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "About Smash Watch",
  description:
    "Learn about Smash Watch’s mission, founding story, and the values that guide how we surface competitive Smash data.",
};

export default function AboutPage() {
  return (
    <>
      <Header mainVisible />
      <div className="about-shell">
        <main className="about-page">
          <section className="about-hero">
        <p className="about-hero__eyebrow">About Smash Watch</p>
        <h1 className="about-hero__title">We turn raw data into living Smash stories.</h1>
        <p className="about-hero__body">
          Smash Watch exists to make competitive insights accessible to every player, TO, and fan.
          We translate bracket chaos into clean visuals so the community can celebrate progress,
          scout rivalries, and support the scenes that keep Melee and Ultimate thriving.
        </p>
      </section>

      <section className="about-story">
        <div className="about-story__image" aria-hidden="true">
          <span className="about-story__glow" />
          <Image
            src="/fox-standing.png"
            alt=""
            width={420}
            height={520}
            priority
            className="about-story__photo"
          />
        </div>

        <div className="about-story__content">
          <p className="about-story__label">Our founding story</p>
          <h2>Built by players who wanted a clearer signal.</h2>
          <p>
            Smash Watch started as a weekend project to help a small local see how their grinders
            stacked up against the rest of the region. The moment we connected the dots between
            disparate bracket exports, we saw a chance to give every scene the same visibility that
            majors enjoy.
          </p>
          <p>
            Today we ingest scores from across North America, normalize the data, and feed it into
            visual tools that surface trends instantly. The goal has never changed: keep the
            community informed, inspired, and ready for the next set.
          </p>
        </div>
      </section>

      <section className="about-mini-banner">
        <div>
          <p className="about-mini-banner__eyebrow">Where we&apos;re headed</p>
          <h3>Your story deserves the spotlight.</h3>
          <p>
            We&apos;re expanding to more regions, richer stats, and collaborative tools so locals can
            publish their own narratives. Follow along and help shape what comes next.
          </p>
        </div>
      </section>
        </main>
        <Footer />
      </div>
  </>
  );
}
