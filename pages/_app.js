// pages/_app.js

import "@/styles/globals.css";
import "@/styles/themes.css";
import "@/styles/starfield.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
