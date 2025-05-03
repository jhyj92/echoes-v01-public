// pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="bg-black text-gold">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body className="bg-black text-gold">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
