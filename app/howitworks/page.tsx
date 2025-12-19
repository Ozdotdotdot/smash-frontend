import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "An end-to-end overview of Smash Watch: data sources, pipeline stages, metrics, and filtering logic.",
};

function parseMarkdownTitle(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith("# ")) return { title: "How it works", body: markdown.trim() };

  const title = firstLine.slice(2).trim() || "How it works";
  let bodyLines = lines.slice(1);
  while (bodyLines.length > 0 && bodyLines[0]?.trim() === "") bodyLines = bodyLines.slice(1);
  return { title, body: bodyLines.join("\n").trim() };
}

export default async function HowItWorksPage() {
  const mdPath = path.join(process.cwd(), "how_it_works.md");
  const markdown = await readFile(mdPath, "utf8");
  const { title, body } = parseMarkdownTitle(markdown);
  return <HowItWorksClient title={title} markdown={body} />;
}
