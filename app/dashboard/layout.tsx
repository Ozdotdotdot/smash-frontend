import type { Metadata, Viewport } from "next";

import PwaServiceWorker from "@/components/PwaServiceWorker";

export const metadata: Metadata = {
  title: "Dashboard",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "smash.watch",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="pwa-snappy">
      <PwaServiceWorker scope="/dashboard/" />
      {children}
    </div>
  );
}

