export const WEBMCP_DASHBOARD_RENDER_EVENT = "smash:webmcp:render" as const;

export type WebMCPDashboardRenderMode = "state" | "tournament";

export type WebMCPDashboardStateRenderFilters = {
  state: string;
  months_back?: number;
  characters?: string;
  filter_state?: string[];
  min_entrants?: number;
  max_entrants?: number;
  min_max_event_entrants?: number;
  large_event_threshold?: number;
  min_large_event_share?: number;
  start_after?: string;
};

export type WebMCPDashboardRenderDetail = {
  target: "dashboard";
  mode: WebMCPDashboardRenderMode;
  filters: WebMCPDashboardStateRenderFilters;
  requestId: string;
  source: "webmcp-tool";
};

export function createWebMCPRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `webmcp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function isWebMCPDashboardRenderDetail(value: unknown): value is WebMCPDashboardRenderDetail {
  if (!value || typeof value !== "object") return false;
  const detail = value as Record<string, unknown>;

  if (detail.target !== "dashboard") return false;
  if (detail.mode !== "state" && detail.mode !== "tournament") return false;
  if (typeof detail.requestId !== "string" || !detail.requestId) return false;
  if (detail.source !== "webmcp-tool") return false;
  if (!detail.filters || typeof detail.filters !== "object") return false;

  const filters = detail.filters as Record<string, unknown>;
  if (typeof filters.state !== "string" || !filters.state.trim()) return false;

  if (filters.months_back !== undefined && !isFiniteNumber(filters.months_back)) return false;
  if (filters.characters !== undefined && typeof filters.characters !== "string") return false;
  if (filters.filter_state !== undefined) {
    if (!Array.isArray(filters.filter_state)) return false;
    if (!filters.filter_state.every((item) => typeof item === "string")) return false;
  }
  if (filters.min_entrants !== undefined && !isFiniteNumber(filters.min_entrants)) return false;
  if (filters.max_entrants !== undefined && !isFiniteNumber(filters.max_entrants)) return false;
  if (
    filters.min_max_event_entrants !== undefined &&
    !isFiniteNumber(filters.min_max_event_entrants)
  ) {
    return false;
  }
  if (filters.large_event_threshold !== undefined && !isFiniteNumber(filters.large_event_threshold)) {
    return false;
  }
  if (filters.min_large_event_share !== undefined && !isFiniteNumber(filters.min_large_event_share)) {
    return false;
  }
  if (filters.start_after !== undefined && typeof filters.start_after !== "string") return false;

  return true;
}
