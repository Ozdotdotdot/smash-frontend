import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SMASH_TOOLS,
  registerSmashTools,
  unregisterSmashTools,
} from "@/lib/webmcp";
import {
  registerNavigationTool,
} from "@/lib/webmcp-navigation";

function setModelContext(value: unknown) {
  Object.defineProperty(navigator, "modelContext", {
    value,
    configurable: true,
  });
}

function clearModelContext() {
  Object.defineProperty(navigator, "modelContext", {
    value: undefined,
    configurable: true,
  });
}

describe("Registration tests", () => {
  afterEach(() => {
    clearModelContext();
    vi.restoreAllMocks();
  });

  it("registerSmashTools() returns false when navigator.modelContext is undefined", () => {
    clearModelContext();
    expect(registerSmashTools()).toBe(false);
  });

  it("registerSmashTools() returns true and calls registerTool() when API exists", () => {
    const mockModelContext = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
    };
    setModelContext(mockModelContext);

    const result = registerSmashTools();
    expect(result).toBe(true);
    expect(mockModelContext.registerTool).toHaveBeenCalled();
  });

  it("registerTool() is called exactly 6 times (one per tool)", () => {
    const mockModelContext = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
    };
    setModelContext(mockModelContext);

    registerSmashTools();
    expect(mockModelContext.registerTool).toHaveBeenCalledTimes(6);
  });

  it("unregisterSmashTools() calls unregisterTool() for each tool name when API exists", () => {
    const mockModelContext = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
    };
    setModelContext(mockModelContext);

    unregisterSmashTools();
    expect(mockModelContext.unregisterTool).toHaveBeenCalledTimes(6);
    for (const tool of SMASH_TOOLS) {
      expect(mockModelContext.unregisterTool).toHaveBeenCalledWith(tool.name);
    }
  });

  it("unregisterSmashTools() is a no-op when navigator.modelContext is undefined", () => {
    clearModelContext();
    // Should not throw
    expect(() => unregisterSmashTools()).not.toThrow();
  });
});

describe("Tool schema validation tests", () => {
  it("all tools have unique names", () => {
    const names = SMASH_TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all tools have non-empty descriptions", () => {
    for (const tool of SMASH_TOOLS) {
      expect(tool.description).toBeTruthy();
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });

  it("read-only data tools have annotations.readOnlyHint === true", () => {
    const dataToolNames = [
      "getRegionStats",
      "listTournamentSeries",
      "getTournamentSeriesStats",
      "searchTournament",
      "getAvailableRegions",
    ];

    for (const toolName of dataToolNames) {
      const tool = SMASH_TOOLS.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      expect(tool!.annotations?.readOnlyHint).toBe(true);
    }
  });

  it("renderRegionDashboard is explicitly marked as non-read-only", () => {
    const tool = SMASH_TOOLS.find((t) => t.name === "renderRegionDashboard");
    expect(tool).toBeDefined();
    expect(tool!.annotations?.readOnlyHint).toBe(false);
  });

  it("each tool's inputSchema has type: 'object' at root", () => {
    for (const tool of SMASH_TOOLS) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema!.type).toBe("object");
    }
  });

  it("getAvailableRegions has no required inputs", () => {
    const tool = SMASH_TOOLS.find((t) => t.name === "getAvailableRegions");
    expect(tool).toBeDefined();
    expect(tool!.inputSchema).toBeDefined();
    expect(tool!.inputSchema!.required).toBeUndefined();
  });
});

describe("Execute callback tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getRegionStats calls /api/precomputed with correct params and returns data", async () => {
    const mockData = { players: [{ name: "Player1" }] };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "getRegionStats")!;
    const result = await tool.execute({ state: "GA", months_back: 6 }, undefined);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/precomputed");
    expect(calledUrl).toContain("state=GA");
    expect(calledUrl).toContain("months_back=6");
    expect(result).toEqual(mockData);
  });

  it("getRegionStats returns { error } when fetch fails (network error)", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "getRegionStats")!;
    const result = await tool.execute({ state: "GA" }, undefined);

    expect(result).toHaveProperty("error");
  });

  it("listTournamentSeries calls /api/precomputed_series without series_key in the URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ series: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "listTournamentSeries")!;
    await tool.execute({ state: "CA" }, undefined);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/precomputed_series");
    expect(calledUrl).not.toContain("series_key");
  });

  it("getTournamentSeriesStats calls /api/precomputed_series with series_key in the URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stats: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "getTournamentSeriesStats")!;
    await tool.execute({ state: "TX", series_key: "my-series" }, undefined);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/precomputed_series");
    expect(calledUrl).toContain("series_key=my-series");
  });

  it("searchTournament calls /api/search/by-slug with tournament_url param", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tournament: {} }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "searchTournament")!;
    await tool.execute({ tournament_url: "some-slug" }, undefined);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/search/by-slug");
    expect(calledUrl).toContain("tournament_url=some-slug");
  });

  it("getAvailableRegions returns an array of state codes without calling fetch", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const tool = SMASH_TOOLS.find((t) => t.name === "getAvailableRegions")!;
    const result = (await tool.execute({}, undefined)) as { regions: string[] };

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.regions).toBeInstanceOf(Array);
    expect(result.regions.length).toBe(50);
    expect(result.regions).toContain("CA");
    expect(result.regions).toContain("NY");
  });

  it("renderRegionDashboard returns invalid_input when state is missing", async () => {
    const tool = SMASH_TOOLS.find((t) => t.name === "renderRegionDashboard")!;
    const result = (await tool.execute({}, undefined)) as {
      ok: boolean;
      reason?: string;
    };

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_input");
  });

  it("renderRegionDashboard returns dashboard_not_active outside /dashboard", async () => {
    window.history.pushState({}, "", "/");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const tool = SMASH_TOOLS.find((t) => t.name === "renderRegionDashboard")!;

    const result = (await tool.execute({ state: "GA" }, undefined)) as {
      ok: boolean;
      reason?: string;
    };

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("dashboard_not_active");
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("renderRegionDashboard dispatches a render event on /dashboard and returns ack", async () => {
    window.history.pushState({}, "", "/dashboard");
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const tool = SMASH_TOOLS.find((t) => t.name === "renderRegionDashboard")!;

    const result = (await tool.execute(
      {
        state: "GA",
        months_back: 3,
        min_entrants: 32,
        filter_state: "GA, FL",
      },
      undefined,
    )) as {
      ok: boolean;
      actionId?: string;
      target?: string;
      mode?: string;
      applied?: { state?: string; filter_state?: string[] };
    };

    expect(result.ok).toBe(true);
    expect(result.actionId).toBeTruthy();
    expect(result.target).toBe("/dashboard");
    expect(result.mode).toBe("state");
    expect(result.applied?.state).toBe("GA");
    expect(result.applied?.filter_state).toEqual(["GA", "FL"]);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Navigation tool tests", () => {
  afterEach(() => {
    clearModelContext();
    vi.restoreAllMocks();
  });

  it("registerNavigationTool() registers a tool named getSiteCapabilities", () => {
    const mockModelContext = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
    };
    setModelContext(mockModelContext);

    registerNavigationTool();

    expect(mockModelContext.registerTool).toHaveBeenCalledTimes(1);
    const registeredTool = mockModelContext.registerTool.mock.calls[0][0];
    expect(registeredTool.name).toBe("getSiteCapabilities");
  });

  it("getSiteCapabilities execute callback returns object with tools_available_at and lists all 6 dashboard tool names", async () => {
    const mockModelContext = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
    };
    setModelContext(mockModelContext);

    registerNavigationTool();

    const registeredTool = mockModelContext.registerTool.mock.calls[0][0];
    const result = (await registeredTool.execute({}, undefined)) as {
      tools_available_at: string;
      available_tools: string[];
    };

    expect(result.tools_available_at).toBe("/dashboard");
    expect(result.available_tools).toHaveLength(6);

    const toolNames = [
      "getRegionStats",
      "listTournamentSeries",
      "getTournamentSeriesStats",
      "searchTournament",
      "getAvailableRegions",
      "renderRegionDashboard",
    ];
    for (const name of toolNames) {
      const found = result.available_tools.some((entry: string) =>
        entry.includes(name)
      );
      expect(found).toBe(true);
    }
  });
});
