import type { ModelContextTool } from "@/types/webmcp";

const AVAILABLE_REGIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

type RegionCode = (typeof AVAILABLE_REGIONS)[number];

async function safeFetch(
  url: string,
  params: Record<string, string>,
): Promise<unknown> {
  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) {
      return {
        error: `Request failed with status ${res.status}`,
        details: await res.text().catch(() => "Unable to read response body"),
      };
    }
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: "Fetch failed", details: message };
  }
}

export const SMASH_TOOLS: ModelContextTool[] = [
  {
    name: "getRegionStats",
    description:
      "Get competitive Smash player performance data for a US state. Returns player stats including weighted win rate and opponent strength.",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "US state code",
          enum: AVAILABLE_REGIONS as unknown as string[],
        },
        months_back: {
          type: "number",
          description: "Number of months to look back (default 3)",
        },
        characters: {
          type: "string",
          description: "Filter by character name",
        },
        min_entrants: {
          type: "number",
          description: "Minimum number of tournament entrants",
        },
        max_entrants: {
          type: "number",
          description: "Maximum number of tournament entrants",
        },
      },
      required: ["state"],
    },
    annotations: { readOnlyHint: true },
    async execute(input: Record<string, unknown>) {
      const params: Record<string, string> = {
        state: String(input.state),
      };
      if (input.months_back != null) params.months_back = String(input.months_back);
      if (input.characters != null) params.characters = String(input.characters);
      if (input.min_entrants != null) params.min_entrants = String(input.min_entrants);
      if (input.max_entrants != null) params.max_entrants = String(input.max_entrants);
      return safeFetch("/api/precomputed", params);
    },
  },
  {
    name: "listTournamentSeries",
    description:
      "Discover recurring tournament series in a US state/region. Returns series names and keys for use with getTournamentSeriesStats.",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "US state code",
          enum: AVAILABLE_REGIONS as unknown as string[],
        },
        months_back: {
          type: "number",
          description: "Number of months to look back (default 3)",
        },
      },
      required: ["state"],
    },
    annotations: { readOnlyHint: true },
    async execute(input: Record<string, unknown>) {
      const params: Record<string, string> = {
        state: String(input.state),
      };
      if (input.months_back != null) params.months_back = String(input.months_back);
      return safeFetch("/api/precomputed_series", params);
    },
  },
  {
    name: "getTournamentSeriesStats",
    description:
      "Get player performance stats for a specific tournament series. Use listTournamentSeries first to get available series_key values.",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "US state code",
          enum: AVAILABLE_REGIONS as unknown as string[],
        },
        series_key: {
          type: "string",
          description: "Series key obtained from listTournamentSeries",
        },
        months_back: {
          type: "number",
          description: "Number of months to look back (default 3)",
        },
        characters: {
          type: "string",
          description: "Filter by character name",
        },
      },
      required: ["state", "series_key"],
    },
    annotations: { readOnlyHint: true },
    async execute(input: Record<string, unknown>) {
      const params: Record<string, string> = {
        state: String(input.state),
        series_key: String(input.series_key),
      };
      if (input.months_back != null) params.months_back = String(input.months_back);
      if (input.characters != null) params.characters = String(input.characters);
      return safeFetch("/api/precomputed_series", params);
    },
  },
  {
    name: "searchTournament",
    description:
      "Look up a specific tournament by its start.gg URL or slug. Returns player performance data from that tournament.",
    inputSchema: {
      type: "object",
      properties: {
        tournament_url: {
          type: "string",
          description: "The start.gg tournament URL or slug",
        },
        state: {
          type: "string",
          description: 'US state code (default "GA")',
          enum: AVAILABLE_REGIONS as unknown as string[],
        },
      },
      required: ["tournament_url"],
    },
    annotations: { readOnlyHint: true },
    async execute(input: Record<string, unknown>) {
      const params: Record<string, string> = {
        tournament_url: String(input.tournament_url),
        state: input.state != null ? String(input.state) : "GA",
      };
      return safeFetch("/api/search/by-slug", params);
    },
  },
  {
    name: "getAvailableRegions",
    description:
      "List all supported US state/region codes that can be used with other tools.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: { readOnlyHint: true },
    async execute() {
      return { regions: AVAILABLE_REGIONS };
    },
  },
];

/**
 * Register all Smash tools with the browser's WebMCP ModelContext.
 * Returns false silently if the browser does not support WebMCP.
 */
export function registerSmashTools(): boolean {
  if (!navigator.modelContext) return false;

  for (const tool of SMASH_TOOLS) {
    navigator.modelContext.registerTool(tool);
  }
  return true;
}

/**
 * Unregister all Smash tools from the browser's WebMCP ModelContext.
 */
export function unregisterSmashTools(): void {
  if (!navigator.modelContext) return;

  for (const tool of SMASH_TOOLS) {
    navigator.modelContext.unregisterTool(tool.name);
  }
}
