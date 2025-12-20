import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "An end-to-end overview of Smash Watch: data sources, pipeline stages, metrics, and filtering logic.",
};

const DESKTOP_RIGHT_PANEL_CUTOFF_X = 860;
const MOBILE_RIGHT_PANEL_CUTOFF_X = 900;

function shouldStripTag(tagContent: string, cutoffX: number) {
  const transformMatch = tagContent.match(/\stransform="([^"]*)"/);
  if (transformMatch) {
    const translateMatch = transformMatch[1].match(/translate\(\s*([-0-9.]+)/);
    if (translateMatch && Number(translateMatch[1]) > cutoffX) return true;
  }

  for (const attr of ["x", "x1", "x2", "cx"] as const) {
    const match = tagContent.match(new RegExp(`\\s${attr}="([-0-9.]+)"`));
    if (match && Number(match[1]) > cutoffX) return true;
  }

  return false;
}

function stripRightPanel(svg: string, cutoffX: number) {
  let out = "";
  let i = 0;
  let skipDepth = 0;

  while (i < svg.length) {
    const lt = svg.indexOf("<", i);
    if (lt === -1) {
      if (skipDepth === 0) out += svg.slice(i);
      break;
    }

    if (skipDepth === 0) out += svg.slice(i, lt);

    if (svg.startsWith("<!--", lt)) {
      const end = svg.indexOf("-->", lt + 4);
      if (end === -1) break;
      if (skipDepth === 0) out += svg.slice(lt, end + 3);
      i = end + 3;
      continue;
    }

    const gt = svg.indexOf(">", lt + 1);
    if (gt === -1) break;

    const tagContent = svg.slice(lt + 1, gt);
    const isClosing = tagContent.trimStart().startsWith("/");
    const isSelfClosing = /\/\s*$/.test(tagContent);

    if (skipDepth > 0) {
      if (!isClosing && !isSelfClosing) skipDepth++;
      if (isClosing) skipDepth--;
      i = gt + 1;
      continue;
    }

    if (!isClosing && shouldStripTag(tagContent, cutoffX)) {
      if (!isSelfClosing) skipDepth = 1;
      i = gt + 1;
      continue;
    }

    out += svg.slice(lt, gt + 1);
    i = gt + 1;
  }

  return out;
}

function normalizeInlineSvg(
  svgSource: string,
  options?: {
    stripRightPanel?: boolean;
    rightPanelCutoffX?: number;
  },
) {
  const start = svgSource.indexOf("<svg");
  if (start === -1) return "";

  const strip = options?.stripRightPanel ?? false;
  const cutoffX = options?.rightPanelCutoffX ?? DESKTOP_RIGHT_PANEL_CUTOFF_X;

  let svg = svgSource.slice(start).trim();
  if (strip) svg = stripRightPanel(svg, cutoffX);

  const openTagMatch = svg.match(/^<svg\b([^>]*)>/);
  if (!openTagMatch) return "";

  let attrs = openTagMatch[1] ?? "";

  if (strip) {
    // Crop the diagram so only the "main" panel renders.
    const targetViewBoxWidth = cutoffX;
    const viewBoxMatch = attrs.match(/\sviewBox="([^"]*)"/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/\s+/);
      if (parts.length === 4) {
        const [x, y, w, h] = parts;
        const wNum = Number(w);
        if (Number.isFinite(wNum) && wNum > targetViewBoxWidth) {
          attrs = attrs.replace(
            /\sviewBox="[^"]*"/,
            ` viewBox="${x} ${y} ${targetViewBoxWidth} ${h}"`,
          );
        }
      }
    }
  }

  // Drop fixed sizing so CSS can make it responsive.
  attrs = attrs.replace(/\s(width|height)="[^"]*"/g, "");

  // Ensure styling + accessibility on the root element (without duplicating attrs).
  if (/\sclass="[^"]*"/.test(attrs)) {
    attrs = attrs.replace(/\sclass="([^"]*)"/, (_, classValue: string) => {
      const merged = `${classValue} howitworks-svg`.trim().replace(/\s+/g, " ");
      return ` class="${merged}"`;
    });
  } else {
    attrs += ` class="howitworks-svg"`;
  }

  if (/\sstyle="[^"]*"/.test(attrs)) {
    attrs = attrs.replace(/\sstyle="([^"]*)"/, (_, styleValue: string) => {
      const merged = `${styleValue};width:100%;height:auto;display:block;`
        .trim()
        .replace(/;+/, ";");
      return ` style="${merged}"`;
    });
  } else {
    attrs += ` style="width:100%;height:auto;display:block;"`;
  }

  if (!/\srole=/.test(attrs)) attrs += ` role="img"`;
  if (!/\saria-label=/.test(attrs)) attrs += ` aria-label="How smash.watch works"`;
  if (!/\spreserveAspectRatio=/.test(attrs)) attrs += ` preserveAspectRatio="xMidYMin meet"`;

  svg = svg.replace(/^<svg\b[^>]*>/, `<svg${attrs}>`);

  return svg;
}

export default async function HowItWorksPage() {
  const desktopSvgPath = path.join(
    process.cwd(),
    "app",
    "howitworks",
    "How the website actually works.excalidraw.svg",
  );
  const mobileSvgPath = path.join(
    process.cwd(),
    "app",
    "howitworks",
    "how the website actually works mobile.svg",
  );

  const [desktopSvgSource, mobileSvgSource] = await Promise.all([
    readFile(desktopSvgPath, "utf8"),
    readFile(mobileSvgPath, "utf8"),
  ]);

  const svgMarkup = normalizeInlineSvg(desktopSvgSource, {
    stripRightPanel: true,
    rightPanelCutoffX: DESKTOP_RIGHT_PANEL_CUTOFF_X,
  });
  const mobileSvgMarkup = normalizeInlineSvg(mobileSvgSource, {
    stripRightPanel: true,
    rightPanelCutoffX: MOBILE_RIGHT_PANEL_CUTOFF_X,
  });

  return <HowItWorksClient svgMarkup={svgMarkup} mobileSvgMarkup={mobileSvgMarkup} />;
}
