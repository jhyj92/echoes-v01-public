"use client";

import "@/styles/globals.css";
import "@/styles/themes.css";
import "@/styles/starfield.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!router.isReady || hasRedirected) return;

    const path = router.pathname;
    const domain = localStorage.getItem("echoes_domain");
    const scenario = localStorage.getItem("echoes_scenario");

    const restrictedPaths = ["/guide", "/hero"];

    // If user tries to access guide/hero without scenario -> redirect home
    if (restrictedPaths.includes(path) && !scenario) {
      setHasRedirected(true);
      router.replace("/");
      return;
    }

    // If user is on landing page but scenario exists -> resume to hero
    if (path === "/" && scenario) {
      setHasRedirected(true);
      router.replace("/hero");
      return;
    }
  }, [router.isReady, router.pathname, hasRedirected]);

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
