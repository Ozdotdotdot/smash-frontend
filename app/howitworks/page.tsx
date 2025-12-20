import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "An end-to-end overview of Smash Watch: data sources, pipeline stages, metrics, and filtering logic.",
};

function normalizeInlineSvg(svgSource: string) {
  const start = svgSource.indexOf("<svg");
  if (start === -1) return "";

  let svg = svgSource.slice(start).trim();

  svg = svg.replace(/^<svg\b/, `<svg`);

  // Drop fixed sizing so CSS can make it responsive.
  svg = svg.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");

  // Add styling + accessibility to the root element.
  svg = svg.replace(
    /^<svg\b/,
    `<svg class="howitworks-svg" style="width:100%;height:auto;display:block;" role="img" aria-label="How smash.watch works"`,
  );

  return svg;
}

export default async function HowItWorksPage() {
  const svgPath = path.join(
    process.cwd(),
    "app",
    "howitworks",
    "How the website actually works.excalidraw.svg",
  );
  const svgSource = await readFile(svgPath, "utf8");
  const svgMarkup = normalizeInlineSvg(svgSource);
  return <HowItWorksClient svgMarkup={svgMarkup} />;
}
