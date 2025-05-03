"use client";

import "@/styles/globals.css";
import "@/styles/themes.css";
import "@/styles/starfield.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Echoes</title>
        <meta
          name="description"
          content="Discover your hidden superpower through poetic reflection."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Flex container to center all pages */}
      <div className="bg-black text-gold min-h-screen flex flex-col items-center justify-center">
        <Component {...pageProps} />
      </div>
    </>
  );
}
