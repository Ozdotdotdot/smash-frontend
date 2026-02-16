import { SMASH_TOOLS } from "@/lib/webmcp";
import type { ModelContextTool, WebMCPDebugHelpers, WebMCPDebugPage } from "@/types/webmcp";

const DASHBOARD_EXPECTED_TOOLS = SMASH_TOOLS.map((tool) => tool.name);
const ROOT_EXPECTED_TOOLS = ["getSiteCapabilities"];

type DiagnosticsReport = {
  page: WebMCPDebugPage;
  checks: {
    secureContext: boolean;
    modelContextType: string;
    registerToolType: string;
    modelContextTestingType: string;
  };
  expectedTools: string[];
  registeredTools: string[];
  missingTools: string[];
  calls: Record<string, unknown>;
};

function getExpectedTools(page: WebMCPDebugPage): string[] {
  return page === "dashboard" ? DASHBOARD_EXPECTED_TOOLS : ROOT_EXPECTED_TOOLS;
}

async function getTestingTools(): Promise<ModelContextTool[]> {
  const testing = navigator.modelContextTesting;
  if (!testing || typeof testing.getTools !== "function") return [];

  const tools = await testing.getTools();
  return Array.isArray(tools) ? tools : [];
}

export async function getRegisteredToolNames(): Promise<string[]> {
  const tools = await getTestingTools();
  return tools
    .map((tool) => tool?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

async function callTool(
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const testing = navigator.modelContextTesting;
  if (!testing || typeof testing.callTool !== "function") {
    return { error: "modelContextTesting.callTool is unavailable" };
  }
  try {
    return await testing.callTool(name, input);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: "Tool call failed", details: message };
  }
}

export async function runWebMCPDiagnostics(
  page: WebMCPDebugPage,
): Promise<DiagnosticsReport> {
  const expectedTools = getExpectedTools(page);
  const registeredTools = await getRegisteredToolNames();
  const missingTools = expectedTools.filter((name) => !registeredTools.includes(name));

  const calls: Record<string, unknown> = {};
  if (page === "dashboard") {
    calls.getAvailableRegions = await callTool("getAvailableRegions", {});
    calls.getRegionStats = await callTool("getRegionStats", {
      state: "GA",
      months_back: 3,
    });
  } else {
    calls.getSiteCapabilities = await callTool("getSiteCapabilities", {});
  }

  return {
    page,
    checks: {
      secureContext: window.isSecureContext,
      modelContextType: typeof navigator.modelContext,
      registerToolType: typeof navigator.modelContext?.registerTool,
      modelContextTestingType: typeof navigator.modelContextTesting,
    },
    expectedTools,
    registeredTools,
    missingTools,
    calls,
  };
}

export function installWebMCPDebugHelpers(page: WebMCPDebugPage): () => void {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return () => {};
  }

  const helpers: WebMCPDebugHelpers = {
    page,
    expectedDashboardTools: [...DASHBOARD_EXPECTED_TOOLS],
    getTools: getRegisteredToolNames,
    runDashboardChecks: () => runWebMCPDiagnostics("dashboard"),
    runRootChecks: () => runWebMCPDiagnostics("root"),
    run: () => runWebMCPDiagnostics(page),
  };

  window.webmcpDebug = helpers;
  return () => {
    if (window.webmcpDebug === helpers) {
      delete window.webmcpDebug;
    }
  };
}
