"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

// =========================
// SVG sizing knobs
// =========================
// Change these to control how large the diagram renders (without editing the SVG itself).
const SVG_MAX_WIDTH_CLASS = "max-w-3xl"; // e.g. "max-w-5xl" | "max-w-7xl" | "max-w-none"
const SVG_SECTION_MARGIN_TOP_CLASS = "mt-10";

export default function HowItWorksClient({ mobileSvgMarkup }: { mobileSvgMarkup: string }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <main className="page-shell page-shell--visible">
        <Header mainVisible />

        <section className="flex w-full flex-col">
          <div
            className={[
              SVG_SECTION_MARGIN_TOP_CLASS,
              "mx-auto w-full overflow-x-auto",
              SVG_MAX_WIDTH_CLASS,
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: mobileSvgMarkup }}
          />
        </section>

        <Footer />
      </main>
    </div>
  );
}
