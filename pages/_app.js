// Global app wrapper – pages/_app.js
import "../styles/themes.css";   // ← relative path (no alias needed)
import "../styles/style.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
