// pages/_app.js
import "../styles/globals.css";
import Head from "next/head";

export default function EchoesApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Echoes</title>
      </Head>

      {/* starfield background shared by all pages */}
      <div className="fixed inset-0 -z-10 bg-star animate-starfield" />

      <Component {...pageProps} />
    </>
  );
}
