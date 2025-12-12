import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Explore Smash Watch dashboards with weighted win rate vs opponent strength.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
