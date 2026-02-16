"use client";

import { useEffect, useState } from "react";
import { registerSmashTools, unregisterSmashTools } from "./webmcp";
import { installWebMCPDebugHelpers } from "./webmcp-diagnostics";

export function useWebMCP() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const cleanupDebug = installWebMCPDebugHelpers("dashboard");
    let registered = false;
    let attempts = 0;
    const maxAttempts = 50;
    let timerId: ReturnType<typeof setInterval> | undefined;

    const tryRegister = () => {
      attempts += 1;
      if (registerSmashTools()) {
        registered = true;
        setSupported(true);
        if (timerId) clearInterval(timerId);
        return;
      }

      if (attempts >= maxAttempts) {
        setSupported(false);
        if (timerId) clearInterval(timerId);
      }
    };

    tryRegister();
    if (!registered) {
      timerId = setInterval(tryRegister, 100);
    }

    return () => {
      if (timerId) clearInterval(timerId);
      cleanupDebug();
      unregisterSmashTools();
    };
  }, []);

  return { supported };
}
