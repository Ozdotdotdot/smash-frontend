import { NextResponse } from "next/server";

const REMOTE_BASE = "https://server.cetacean-tuna.ts.net/search/by-slug";
const DEFAULTS: Record<string, string> = {
  videogame_id: "1386",
  limit: "0",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const remoteUrl = new URL(REMOTE_BASE);

  // Apply defaults first
  Object.entries(DEFAULTS).forEach(([key, val]) => {
    remoteUrl.searchParams.set(key, searchParams.get(key) ?? val);
  });

  // Forward all incoming params
  searchParams.forEach((value, key) => {
    if (!remoteUrl.searchParams.has(key)) {
      remoteUrl.searchParams.set(key, value);
    }
  });

  try {
    const res = await fetch(remoteUrl.toString(), { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Upstream error ${res.status}`, upstream: text },
        { status: res.status },
      );
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
