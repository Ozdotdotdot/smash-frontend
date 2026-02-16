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
  spy: {
    installed: boolean;
    registerCalls: number;
    unregisterCalls: number;
    trackedTools: string[];
  };
};

type WebMCPSpyState = {
  installed: boolean;
  registerCalls: number;
  unregisterCalls: number;
  trackedTools: Set<string>;
  originalRegisterTool?: (tool: ModelContextTool) => void;
  originalUnregisterTool?: (name: string) => void;
};

declare global {
  interface Window {
    __webmcpSpyState?: WebMCPSpyState;
  }
}

function getExpectedTools(page: WebMCPDebugPage): string[] {
  return page === "dashboard" ? DASHBOARD_EXPECTED_TOOLS : ROOT_EXPECTED_TOOLS;
}

function getSpyState(): WebMCPSpyState {
  if (!window.__webmcpSpyState) {
    window.__webmcpSpyState = {
      installed: false,
      registerCalls: 0,
      unregisterCalls: 0,
      trackedTools: new Set<string>(),
    };
  }
  return window.__webmcpSpyState;
}

function installModelContextSpy(): WebMCPSpyState {
  const spy = getSpyState();
  if (spy.installed) return spy;

  const modelContext = navigator.modelContext;
  if (!modelContext) return spy;

  try {
    spy.originalRegisterTool = modelContext.registerTool.bind(modelContext);
    spy.originalUnregisterTool = modelContext.unregisterTool.bind(modelContext);

    modelContext.registerTool = (tool: ModelContextTool) => {
      spy.registerCalls += 1;
      spy.originalRegisterTool?.(tool);
      if (tool?.name) spy.trackedTools.add(tool.name);
    };

    modelContext.unregisterTool = (name: string) => {
      spy.unregisterCalls += 1;
      spy.originalUnregisterTool?.(name);
      spy.trackedTools.delete(name);
    };

    spy.installed = true;
  } catch {
    spy.installed = false;
  }
  return spy;
}

async function getTestingTools(): Promise<ModelContextTool[]> {
  const testing = navigator.modelContextTesting;
  if (!testing) return [];

  const listToolsFn =
    typeof testing.getTools === "function"
      ? testing.getTools.bind(testing)
      : typeof testing.listTools === "function"
        ? testing.listTools.bind(testing)
        : undefined;
  if (!listToolsFn) return [];

  const tools = await listToolsFn();
  return Array.isArray(tools) ? tools : [];
}

export async function getRegisteredToolNames(): Promise<string[]> {
  const tools = await getTestingTools();
  if (tools.length === 0) {
    return Array.from(getSpyState().trackedTools);
  }
  return tools
    .map((tool) => tool?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

async function callTool(
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const testing = navigator.modelContextTesting;
  if (!testing) {
    return { error: "modelContextTesting is unavailable" };
  }

  const executeFn =
    typeof testing.callTool === "function"
      ? testing.callTool.bind(testing)
      : typeof testing.executeTool === "function"
        ? testing.executeTool.bind(testing)
        : undefined;

  if (executeFn) {
    try {
      return await executeFn(name, input);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: "Tool call failed via testing API", details: message };
    }
  }

  const tools = await getTestingTools();
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool || typeof tool.execute !== "function") {
    return { error: "modelContextTesting tool execution methods are unavailable" };
  }

  try {
    return await tool.execute(input, undefined);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: "Tool call failed via execute fallback", details: message };
  }
}

export async function runWebMCPDiagnostics(
  page: WebMCPDebugPage,
): Promise<DiagnosticsReport> {
  const spy = getSpyState();
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
    calls.renderRegionDashboard = await callTool("renderRegionDashboard", {
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
    spy: {
      installed: spy.installed,
      registerCalls: spy.registerCalls,
      unregisterCalls: spy.unregisterCalls,
      trackedTools: Array.from(spy.trackedTools),
    },
  };
}

export function installWebMCPDebugHelpers(page: WebMCPDebugPage): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryEnabled = urlParams.get("webmcpDebug") === "1";
  const localStorageEnabled = (() => {
    try {
      return window.localStorage.getItem("webmcpDebug") === "1";
    } catch {
      return false;
    }
  })();
  const allowInThisSession =
    process.env.NODE_ENV !== "production" || queryEnabled || localStorageEnabled;

  if (!allowInThisSession) {
    return () => {};
  }

  installModelContextSpy();

  const helpers: WebMCPDebugHelpers = {
    page,
    expectedDashboardTools: [...DASHBOARD_EXPECTED_TOOLS],
    getTools: getRegisteredToolNames,
    getSpyState: () => {
      const spy = getSpyState();
      return {
        installed: spy.installed,
        registerCalls: spy.registerCalls,
        unregisterCalls: spy.unregisterCalls,
        trackedTools: Array.from(spy.trackedTools),
      };
    },
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
