import fs from "fs";
import path from "path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TocItem = { id: string; text: string; level: number };

function slugify(text: string, counts: Record<string, number> = {}): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const count = counts[base] ?? 0;
  counts[base] = count + 1;
  return count === 0 ? base : `${base}-${count}`;
}

function buildToc(md: string): TocItem[] {
  const toc: TocItem[] = [];
  const slugCounts: Record<string, number> = {};
  md
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((line) => {
      const match = /^#{1,6}\s+(.+)/.exec(line.trim());
      if (!match) return;
      const level = Math.min(match[0].match(/^#+/)?.[0].length ?? 1, 6);
      const text = match[1].trim();
      const id = slugify(text, slugCounts);
      toc.push({ id, text, level });
    });
  return toc;
}

export default function DocsPage() {
  const docPath = path.join(process.cwd(), "DOCUMENTATION.md");
  const markdown = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "# Documentation\nContent not found.";
  const toc = buildToc(markdown);
  const groupedToc: Array<TocItem & { children: TocItem[] }> = [];
  let current: TocItem & { children: TocItem[] } | null = null;

  toc.forEach((item) => {
    if (item.level <= 2 || !current) {
      const section = { ...item, children: [] as TocItem[] };
      groupedToc.push(section);
      current = section;
      return;
    }
    current.children.push(item);
  });
  const headingSlugCounts: Record<string, number> = {};

  const headingWithId = (Tag: "h1" | "h2" | "h3") =>
    // eslint-disable-next-line react/display-name
    ({ node, ...props }: any) => {
      const text = String(props.children);
      const id = slugify(text, headingSlugCounts);
      return (
        <Tag id={id} className="docs-heading" {...props}>
          {props.children}
        </Tag>
      );
    };

  return (
    <main className="docs-page">
      <div className="docs-hero">
        <div className="docs-breadcrumbs">
          <Link href="/" className="docs-link">
            Home
          </Link>
          <span className="docs-separator">/</span>
          <span className="docs-current">Docs</span>
        </div>
        <h1 className="docs-title">Documentation</h1>
        <p className="docs-subtitle">Guides, notes, and reference for smash.watch.</p>
      </div>

      <div className="docs-shell">
        <input id="docs-nav-toggle" type="checkbox" className="docs-nav-toggle" />
        <label htmlFor="docs-nav-toggle" className="docs-nav-toggle__label">
          <span className="docs-nav-toggle__icon" aria-hidden />
          <span>Docs navigation</span>
        </label>
        <aside className="docs-nav">
          <div className="docs-nav__label">On this page</div>
          <ul className="docs-nav__list">
            {groupedToc.map((section) => (
              <li key={section.id} className="docs-nav__section">
                <details open>
                  <summary>
                    <a href={`#${section.id}`}>{section.text}</a>
                  </summary>
                  {section.children.length > 0 ? (
                    <ul>
                      {section.children.map((child) => (
                        <li key={child.id} className={`docs-nav__item docs-nav__item--lvl-${Math.min(child.level, 3)}`}>
                          <a href={`#${child.id}`}>{child.text}</a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </details>
              </li>
            ))}
          </ul>
        </aside>
        <section className="docs-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: headingWithId("h1"),
              h2: headingWithId("h2"),
              h3: headingWithId("h3"),
              p: ({ node, ...props }) => <p className="docs-paragraph" {...props} />,
              ul: ({ node, ...props }) => <ul className="docs-list" {...props} />,
              ol: ({ node, ...props }) => <ol className="docs-list docs-list--ordered" {...props} />,
              li: ({ node, ...props }) => <li className="docs-list__item" {...props} />,
              pre: ({ node, ...props }) => (
                <pre className="docs-code" {...props}>
                  {props.children}
                </pre>
              ),
              code: ({ inline, className, children, ...props }) =>
                inline ? (
                  <code className="docs-inline-code" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ),
              blockquote: ({ node, ...props }) => <blockquote className="docs-quote" {...props} />,
              table: ({ node, ...props }) => <table className="docs-table" {...props} />,
              thead: ({ node, ...props }) => <thead className="docs-table__head" {...props} />,
              tbody: ({ node, ...props }) => <tbody className="docs-table__body" {...props} />,
              th: ({ node, ...props }) => <th className="docs-table__cell docs-table__cell--head" {...props} />,
              td: ({ node, ...props }) => <td className="docs-table__cell" {...props} />,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </section>
      </div>
    </main>
  );
}
