// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className="bg-black text-gold">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
