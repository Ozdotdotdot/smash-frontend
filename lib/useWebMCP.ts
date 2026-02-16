"use client";

import { useEffect, useState } from "react";
import { registerSmashTools, unregisterSmashTools } from "./webmcp";
import { installWebMCPDebugHelpers } from "./webmcp-diagnostics";

export function useWebMCP() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = registerSmashTools();
    const cleanupDebug = installWebMCPDebugHelpers("dashboard");
    setSupported(isSupported);
    return () => {
      cleanupDebug();
      unregisterSmashTools();
    };
  }, []);

  return { supported };
}
