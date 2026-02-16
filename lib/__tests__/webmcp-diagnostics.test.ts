import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRegisteredToolNames,
  installWebMCPDebugHelpers,
  runWebMCPDiagnostics,
} from "@/lib/webmcp-diagnostics";

function setModelContextTesting(value: unknown) {
  Object.defineProperty(navigator, "modelContextTesting", {
    value,
    configurable: true,
  });
}

function clearModelContextTesting() {
  Object.defineProperty(navigator, "modelContextTesting", {
    value: undefined,
    configurable: true,
  });
}

describe("webmcp diagnostics helper", () => {
  afterEach(() => {
    clearModelContextTesting();
    delete window.webmcpDebug;
    vi.restoreAllMocks();
  });

  it("getRegisteredToolNames returns names from modelContextTesting.getTools()", async () => {
    setModelContextTesting({
      getTools: vi.fn().mockReturnValue([
        { name: "getRegionStats" },
        { name: "getAvailableRegions" },
      ]),
    });

    const names = await getRegisteredToolNames();
    expect(names).toEqual(["getRegionStats", "getAvailableRegions"]);
  });

  it("runWebMCPDiagnostics('dashboard') reports no missing tools when all are registered", async () => {
    const toolNames = [
      "getRegionStats",
      "listTournamentSeries",
      "getTournamentSeriesStats",
      "searchTournament",
      "getAvailableRegions",
    ];

    setModelContextTesting({
      getTools: vi.fn().mockReturnValue(toolNames.map((name) => ({ name }))),
      callTool: vi.fn(async (name: string) => ({ ok: true, name })),
    });

    const report = await runWebMCPDiagnostics("dashboard");
    expect(report.missingTools).toEqual([]);
    expect(report.registeredTools).toEqual(toolNames);
    expect(report.calls.getAvailableRegions).toEqual({
      ok: true,
      name: "getAvailableRegions",
    });
  });

  it("runWebMCPDiagnostics('root') reports missing getSiteCapabilities when not registered", async () => {
    setModelContextTesting({
      getTools: vi.fn().mockReturnValue([{ name: "getRegionStats" }]),
      callTool: vi.fn(async () => ({ ok: true })),
    });

    const report = await runWebMCPDiagnostics("root");
    expect(report.missingTools).toEqual(["getSiteCapabilities"]);
  });

  it("runWebMCPDiagnostics uses execute fallback when callTool is unavailable", async () => {
    setModelContextTesting({
      getTools: vi.fn().mockReturnValue([
        {
          name: "getSiteCapabilities",
          execute: vi.fn(async () => ({ tools_available_at: "/dashboard" })),
        },
      ]),
    });

    const report = await runWebMCPDiagnostics("root");
    expect(report.missingTools).toEqual([]);
    expect(report.calls.getSiteCapabilities).toEqual({
      tools_available_at: "/dashboard",
    });
  });

  it("installWebMCPDebugHelpers attaches and cleans up window.webmcpDebug", () => {
    const cleanup = installWebMCPDebugHelpers("dashboard");
    expect(window.webmcpDebug).toBeDefined();
    expect(window.webmcpDebug?.page).toBe("dashboard");
    cleanup();
    expect(window.webmcpDebug).toBeUndefined();
  });
});
