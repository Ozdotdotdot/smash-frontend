import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PRIVACY_PATH = path.join(
  process.cwd(),
  "chromium-extension",
  "PRIVACY.md",
);

export const metadata: Metadata = {
  title: "Chromium Extension Privacy",
  description: "Privacy notice for the Smash Watch Chromium/Chrome extension.",
};

async function loadPrivacyMarkdown() {
  return readFile(PRIVACY_PATH, "utf8");
}

export default async function ChromiumExtensionPage() {
  const markdown = await loadPrivacyMarkdown();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-foreground shadow-xl shadow-black/30 backdrop-blur-sm">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            Chromium Extension
          </p>
          <h1 className="text-3xl font-bold leading-tight text-white">Privacy Notice</h1>
        </header>

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="markdown-content"
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-semibold" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="leading-relaxed text-white/90" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul
                className="ml-5 list-disc space-y-2 text-white/90"
                {...props}
              />
            ),
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-white" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-sky-300 underline decoration-sky-300/70 decoration-2 underline-offset-4 hover:decoration-sky-200"
                {...props}
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </main>
  );
}
