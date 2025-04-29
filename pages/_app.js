// pages/_app.js
import "@styles/themes.css";   // global theme
import "@styles/style.css";    // base styles (rename path)

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
