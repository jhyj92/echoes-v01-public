// pages/_app.js
import "../styles/themes.css";          // ⬅️  add (or move) the global theme
import "../style.css";           // ⬅️  keep your base styles

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
