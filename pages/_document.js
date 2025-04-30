// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* TODO: add meta tags, favicon links, etc */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
