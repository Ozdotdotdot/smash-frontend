import { describe, it, expect, afterEach, vi } from "vitest";
import { SMASH_API_BASE } from "@/app/api/config";

describe("API route handlers return JSON", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const upstreamPayloads: Record<string, unknown> = {
    precomputed: { players: [{ name: "TestPlayer", winRate: 0.75 }] },
    precomputed_series: { series: [{ key: "locals", name: "GA Locals" }] },
    search: { results: [{ id: 1, tag: "Mang0" }] },
    "search/by-slug": { tournament: { slug: "genesis-9", name: "Genesis 9" } },
  };

  function mockUpstreamFetch(payload: unknown) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      }),
    );
  }

  function makeRequest(path: string, params?: Record<string, string>) {
    const url = new URL(`http://localhost/api/${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return new Request(url.toString());
  }

  it("GET /api/precomputed returns JSON with correct content-type", async () => {
    mockUpstreamFetch(upstreamPayloads.precomputed);
    const { GET } = await import("@/app/api/precomputed/route");

    const response = await GET(makeRequest("precomputed", { state: "GA" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual(upstreamPayloads.precomputed);
  });

  it("GET /api/precomputed_series returns JSON with correct content-type", async () => {
    mockUpstreamFetch(upstreamPayloads.precomputed_series);
    const { GET } = await import("@/app/api/precomputed_series/route");

    const response = await GET(makeRequest("precomputed_series", { state: "GA" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual(upstreamPayloads.precomputed_series);
  });

  it("GET /api/search returns JSON with correct content-type", async () => {
    mockUpstreamFetch(upstreamPayloads.search);
    const { GET } = await import("@/app/api/search/route");

    const response = await GET(makeRequest("search", { state: "GA" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual(upstreamPayloads.search);
  });

  it("GET /api/search/by-slug returns JSON with correct content-type", async () => {
    mockUpstreamFetch(upstreamPayloads["search/by-slug"]);
    const { GET } = await import("@/app/api/search/by-slug/route");

    const response = await GET(
      makeRequest("search/by-slug", { tournament_url: "genesis-9" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual(upstreamPayloads["search/by-slug"]);
  });

  it("all routes forward requests to SMASH_API_BASE (smashapi path)", async () => {
    const routes = [
      { path: "precomputed", module: "@/app/api/precomputed/route" },
      { path: "precomputed_series", module: "@/app/api/precomputed_series/route" },
      { path: "search", module: "@/app/api/search/route" },
      { path: "search/by-slug", module: "@/app/api/search/by-slug/route" },
    ];

    for (const route of routes) {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal("fetch", fetchMock);

      const { GET } = await import(/* @vite-ignore */ route.module);
      await GET(makeRequest(route.path, { state: "GA" }));

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain(SMASH_API_BASE);
      expect(calledUrl).toContain(`/smashapi/${route.path}`);

      vi.restoreAllMocks();
    }
  });

  it("routes return JSON error when upstream returns non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve("Bad Gateway"),
        json: () => Promise.resolve({ error: "Bad Gateway" }),
      }),
    );

    const { GET } = await import("@/app/api/precomputed/route");
    const response = await GET(makeRequest("precomputed"));

    expect(response.status).toBe(502);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("routes return JSON error when fetch throws a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );

    const { GET } = await import("@/app/api/precomputed/route");
    const response = await GET(makeRequest("precomputed"));

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body.error).toBe("ECONNREFUSED");
  });
});
