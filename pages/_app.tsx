// pages/_app.tsx
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
        <meta name="description" content="Discover your hidden superpower through poetic reflection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* This is the critical flex wrapper */}
      <div className="min-h-screen flex flex-col bg-black text-gold">
        <Component {...pageProps} />
      </div>
    </>
  );
}
