// pages/_app.js
import "../styles/globals.css";      // Tailwind base / star-field / shared classes
import "../styles/themes.css";      // gold palette, fades, button primitives
import Head from "next/head";

export default function EchoesApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Echoes</title>
      </Head>
      {/* ───── starfield lives at _app level so every page shares it ───── */}
      <div className="fixed inset-0 -z-10 bg-star animate-starfield" />
      <Component {...pageProps} />
    </>
  );
}
