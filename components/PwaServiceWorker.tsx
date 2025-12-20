"use client";

import { useEffect } from "react";

type Props = {
  scope?: string;
};

export default function PwaServiceWorker({ scope = "/" }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope }).catch(() => {});
    };

    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [scope]);

  return null;
}

