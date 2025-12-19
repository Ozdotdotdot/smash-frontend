import type { Metadata } from "next";

import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "An end-to-end overview of Smash Watch: data sources, pipeline stages, metrics, and filtering logic.",
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}

