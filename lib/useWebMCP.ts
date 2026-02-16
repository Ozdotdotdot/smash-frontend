"use client";

import { useEffect, useState } from "react";
import { registerSmashTools, unregisterSmashTools } from "./webmcp";

export function useWebMCP() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = registerSmashTools();
    setSupported(isSupported);
    return () => unregisterSmashTools();
  }, []);

  return { supported };
}
