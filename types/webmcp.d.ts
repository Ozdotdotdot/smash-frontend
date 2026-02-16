export interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
    client: unknown,
  ) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
}

export interface ModelContext {
  registerTool(tool: ModelContextTool): void;
  unregisterTool(name: string): void;
  provideContext(options: { tools: ModelContextTool[] }): void;
  clearContext(): void;
}

export interface ModelContextTesting {
  getTools(): ModelContextTool[] | Promise<ModelContextTool[]>;
  callTool(
    name: string,
    input: Record<string, unknown>,
  ): Promise<unknown>;
}

export type WebMCPDebugPage = "dashboard" | "root";

export interface WebMCPDebugHelpers {
  page: WebMCPDebugPage;
  expectedDashboardTools: string[];
  getTools: () => Promise<string[]>;
  runDashboardChecks: () => Promise<unknown>;
  runRootChecks: () => Promise<unknown>;
  run: () => Promise<unknown>;
}

declare global {
  interface Navigator {
    modelContext?: ModelContext;
    modelContextTesting?: ModelContextTesting;
  }

  interface Window {
    webmcpDebug?: WebMCPDebugHelpers;
  }
}
