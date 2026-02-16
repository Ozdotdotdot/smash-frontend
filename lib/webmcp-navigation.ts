/**
 * WebMCP navigation tool for the root page.
 * Helps agents discover that /dashboard has the main analytics tools.
 */

const SITE_CAPABILITIES_TOOL = {
  name: "getSiteCapabilities",
  description:
    "Returns the available tools and pages on smash.watch. Navigate to /dashboard to access player statistics, tournament data, and regional analysis tools for competitive Super Smash Bros. Melee.",
  inputSchema: { type: "object" as const, properties: {} },
  annotations: { readOnlyHint: true },
  async execute() {
    return {
      site: "smash.watch",
      description: "Competitive Super Smash Bros. Melee analytics platform",
      tools_available_at: "/dashboard",
      available_tools: [
        "getRegionStats - Player performance data by US state",
        "listTournamentSeries - Discover recurring tournament series",
        "getTournamentSeriesStats - Stats for a specific tournament series",
        "searchTournament - Look up tournaments by start.gg URL",
        "getAvailableRegions - List supported US state/region codes",
      ],
    };
  },
};

export function registerNavigationTool(): boolean {
  if (!navigator.modelContext) return false;
  navigator.modelContext.registerTool(SITE_CAPABILITIES_TOOL);
  return true;
}

export function unregisterNavigationTool(): void {
  if (!navigator.modelContext) return;
  navigator.modelContext.unregisterTool(SITE_CAPABILITIES_TOOL.name);
}
