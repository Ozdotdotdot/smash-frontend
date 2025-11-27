import { NextResponse } from "next/server";

const REMOTE_BASE = "https://server.cetacean-tuna.ts.net/precomputed_series";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const remoteUrl = new URL(REMOTE_BASE);

  // Apply defaults for common params, then forward any extras verbatim.
  const defaults = new Map<string, string>([
    ["state", "GA"],
    ["months_back", "3"],
    ["limit", "0"],
  ]);

  defaults.forEach((val, key) => {
    remoteUrl.searchParams.set(key, searchParams.get(key) ?? val);
  });

  searchParams.forEach((value, key) => {
    if (!remoteUrl.searchParams.has(key)) {
      remoteUrl.searchParams.set(key, value);
    }
  });

  try {
    const res = await fetch(remoteUrl.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error ${res.status}` },
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
