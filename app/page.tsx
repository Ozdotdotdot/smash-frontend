import { Suspense } from "react";
import HomeClient from "./HomeClient";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function HomePage({ searchParams }: PageProps) {
  const raw = searchParams?.skipSplash;
  const val = Array.isArray(raw) ? raw[0] : raw;
  const initialSkipSplash = val === "1" || val === "true";

  return (
    <Suspense fallback={null}>
      <HomeClient initialSkipSplash={initialSkipSplash} />
    </Suspense>
  );
}

