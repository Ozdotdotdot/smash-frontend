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

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}
