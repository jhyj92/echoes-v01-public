// pages/_app.js
"use client";

import "../styles/themes.css";   // <-- only global import lives here
import "../styles/style.css";    // (optional base styles)

/** Keep _app.js minimal: just pass page props */
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
