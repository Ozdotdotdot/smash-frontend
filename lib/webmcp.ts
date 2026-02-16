import type { ModelContextTool } from "@/types/webmcp";
import {
  createWebMCPRequestId,
  WEBMCP_DASHBOARD_RENDER_EVENT,
} from "@/lib/webmcp-events";

const AVAILABLE_REGIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

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

function toFiniteNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toCsvStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => String(item).trim().toUpperCase())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
    return normalized.length ? normalized : undefined;
  }

  return undefined;
}

function parseRegionStateInput(input: Record<string, unknown>) {
  const stateRaw = input.state;
  if (typeof stateRaw !== "string" || !stateRaw.trim()) {
    return {
      ok: false as const,
      error: "Validation failed",
      details: "state is required and must be a non-empty US state code",
    };
  }

  const state = stateRaw.trim().toUpperCase();
  if (!AVAILABLE_REGIONS.includes(state as (typeof AVAILABLE_REGIONS)[number])) {
    return {
      ok: false as const,
      error: "Validation failed",
      details: `Unsupported state code: ${state}`,
    };
  }

  return { ok: true as const, state };
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
  {
    name: "renderRegionDashboard",
    description:
      "Trigger the /dashboard page UI to render the state analytics view with provided filters. This is a UI action tool (not read-only data retrieval).",
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
          description: "Number of months to look back (maps to dashboard timeframe)",
        },
        characters: {
          type: "string",
          description: "Comma-separated character filter terms",
        },
        filter_state: {
          description: "State filter(s) to apply in addition to primary state",
          oneOf: [
            { type: "string" },
            {
              type: "array",
              items: { type: "string" },
            },
          ],
        },
        min_entrants: {
          type: "number",
          description: "Minimum average entrants threshold",
        },
        max_entrants: {
          type: "number",
          description: "Maximum average entrants threshold",
        },
        min_max_event_entrants: {
          type: "number",
          description: "Minimum max entrants among a player's events",
        },
        large_event_threshold: {
          type: "number",
          description: "Entrant cutoff treated as a large event",
        },
        min_large_event_share: {
          type: "number",
          description: "Minimum share (0-1) of large events",
        },
        start_after: {
          type: "string",
          description: "Date string (YYYY-MM-DD)",
        },
      },
      required: ["state"],
    },
    annotations: { readOnlyHint: false },
    async execute(input: Record<string, unknown>) {
      const parsed = parseRegionStateInput(input);
      if (!parsed.ok) {
        return {
          ok: false,
          reason: "invalid_input",
          error: parsed.error,
          details: parsed.details,
        };
      }

      if (typeof window === "undefined") {
        return {
          ok: false,
          reason: "not_browser_context",
          error: "Dashboard rendering events can only be dispatched in a browser context",
        };
      }

      if (window.location.pathname !== "/dashboard") {
        return {
          ok: false,
          reason: "dashboard_not_active",
          error: "Open /dashboard before calling renderRegionDashboard",
        };
      }

      const requestId = createWebMCPRequestId();
      const monthsBack = toFiniteNumberOrUndefined(input.months_back);
      const minEntrants = toFiniteNumberOrUndefined(input.min_entrants);
      const maxEntrants = toFiniteNumberOrUndefined(input.max_entrants);
      const minMaxEventEntrants = toFiniteNumberOrUndefined(input.min_max_event_entrants);
      const largeEventThreshold = toFiniteNumberOrUndefined(input.large_event_threshold);
      const minLargeEventShare = toFiniteNumberOrUndefined(input.min_large_event_share);
      const startAfter = typeof input.start_after === "string" ? input.start_after : undefined;
      const characters = typeof input.characters === "string" ? input.characters : undefined;
      const filterState = toCsvStringArray(input.filter_state);

      const detail = {
        target: "dashboard" as const,
        mode: "state" as const,
        requestId,
        source: "webmcp-tool" as const,
        filters: {
          state: parsed.state,
          months_back: monthsBack,
          characters,
          filter_state: filterState,
          min_entrants: minEntrants,
          max_entrants: maxEntrants,
          min_max_event_entrants: minMaxEventEntrants,
          large_event_threshold: largeEventThreshold,
          min_large_event_share: minLargeEventShare,
          start_after: startAfter,
        },
      };

      window.dispatchEvent(new CustomEvent(WEBMCP_DASHBOARD_RENDER_EVENT, { detail }));

      return {
        ok: true,
        actionId: requestId,
        target: "/dashboard",
        mode: "state",
        applied: detail.filters,
        message: "Dashboard render request dispatched.",
      };
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
