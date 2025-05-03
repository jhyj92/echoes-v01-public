"use client";

import "@/styles/globals.css";
import "@/styles/themes.css";
import "@/styles/starfield.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = router.pathname;
    const domain = localStorage.getItem("echoes_domain");
    const scenario = localStorage.getItem("echoes_scenario");

    const restrictedPaths = ["/guide", "/hero"];
    if (restrictedPaths.includes(path) && !scenario) {
      router.replace("/");
      return;
    }

    if (path === "/" && scenario) {
      router.replace("/hero");
      return;
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Echoes</title>
        <meta name="description" content="Discover your hidden superpower through poetic reflection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="bg-black text-gold min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}
