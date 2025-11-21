"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GridLoaderType = typeof import("react-spinners").GridLoader;

export default function Home() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [GridLoaderComponent, setGridLoaderComponent] =
    useState<GridLoaderType | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsSplashVisible(false), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    import("react-spinners").then((mod) => {
      if (isMounted) {
        setGridLoaderComponent(() => mod.GridLoader);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!GridLoaderComponent) {
    return null; // wait to render splash until loader is ready so text + spinner appear together
  }

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background transition-opacity duration-500 ${
          isSplashVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="text-3xl font-semibold tracking-tight">smash.watch</span>
        <GridLoaderComponent color="currentColor" />
      </div>

      <div
        className={`flex min-h-screen items-center justify-center transition-opacity duration-500 ${
          isSplashVisible ? "opacity-0" : "opacity-100"
        }`}
      >
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-background py-32 px-16 sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center text-foreground sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
              To get started, edit the page.tsx file.
            </h1>
            <p className="max-w-md text-lg leading-8 text-foreground/80">
              Looking for a starting point or more instructions? Head over to{" "}
              <a
                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-foreground"
              >
                Templates
              </a>{" "}
              or the{" "}
              <a
                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-foreground"
              >
                Learning
              </a>{" "}
              center.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Deploy Now
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
