import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const raw = resolvedSearchParams.skipSplash;
  const val = Array.isArray(raw) ? raw[0] : raw;
  const initialSkipSplash = val === "1" || val === "true";

  return (
    <HomeClient initialSkipSplash={initialSkipSplash} />
  );
}
